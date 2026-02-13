import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCoachingRequestDto } from './dto/create-coaching-request.dto';
import { RespondCoachingRequestDto } from './dto/respond-coaching-request.dto';

@Injectable()
export class CoachingService {
  constructor(private prisma: PrismaService) { }

  // ────────────────────────────────────────────────────────────
  // Helpers — Sécurité
  // ────────────────────────────────────────────────────────────

  /** Vérifie qu'une relation ACCEPTED existe entre le coach et le client */
  private async assertCoachClientRelationship(coachId: number, clientId: number) {
    const rel = await this.prisma.coachingRelationship.findFirst({
      where: { coachId, clientId, status: 'ACCEPTED' },
    });
    if (!rel) {
      throw new ForbiddenException(
        'Accès refusé : aucune relation de coaching active avec cet utilisateur.',
      );
    }
    return rel;
  }

  /** Vérifie que l'utilisateur a le rôle COACH */
  private async assertIsCoach(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    if (user.role !== 'COACH') {
      throw new ForbiddenException('Accès réservé aux comptes Coach.');
    }
  }

  // ────────────────────────────────────────────────────────────
  // CRÉER / RÉPONDRE / SUPPRIMER
  // ────────────────────────────────────────────────────────────

  async createRequest(coachId: number, dto: CreateCoachingRequestDto) {
    const { uniqueCode } = dto;

    await this.assertIsCoach(coachId);

    const client = await this.prisma.user.findUnique({
      where: { friendCode: uniqueCode },
    });
    if (!client) {
      throw new NotFoundException(
        `Aucun utilisateur trouvé avec le code ${uniqueCode}.`,
      );
    }
    if (client.id === coachId) {
      throw new BadRequestException('Vous ne pouvez pas vous coacher vous-même.');
    }

    const existing = await this.prisma.coachingRelationship.findUnique({
      where: { coachId_clientId: { coachId, clientId: client.id } },
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        throw new BadRequestException('Cet utilisateur est déjà votre client.');
      }
      if (existing.status === 'PENDING') {
        throw new BadRequestException(
          'Une demande est déjà en attente pour cet utilisateur.',
        );
      }
      // REJECTED → Remettre en PENDING (réessai autorisé)
      return this.prisma.coachingRelationship.update({
        where: { id: existing.id },
        data: { status: 'PENDING' },
      });
    }

    return this.prisma.coachingRelationship.create({
      data: { coachId, clientId: client.id, status: 'PENDING' },
    });
  }

  async respondToRequest(clientId: number, dto: RespondCoachingRequestDto) {
    const { requestId, status } = dto;

    const relationship = await this.prisma.coachingRelationship.findUnique({
      where: { id: requestId },
    });
    if (!relationship) {
      throw new NotFoundException('Demande de coaching introuvable.');
    }
    if (relationship.clientId !== clientId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à répondre à cette demande.",
      );
    }
    if (relationship.status !== 'PENDING') {
      throw new BadRequestException(
        `Cette demande a déjà été traitée (statut: ${relationship.status}).`,
      );
    }

    return this.prisma.coachingRelationship.update({
      where: { id: requestId },
      data: { status },
    });
  }

  async terminateRelationship(userId: number, relationshipId: number) {
    const relationship = await this.prisma.coachingRelationship.findUnique({
      where: { id: relationshipId },
    });
    if (!relationship) {
      throw new NotFoundException('Relation de coaching introuvable.');
    }
    if (relationship.coachId !== userId && relationship.clientId !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à rompre cette relation.",
      );
    }

    return this.prisma.coachingRelationship.delete({
      where: { id: relationshipId },
    });
  }

  // ────────────────────────────────────────────────────────────
  // LECTURE — Demandes en attente / Mon coach
  // ────────────────────────────────────────────────────────────

  async getPendingRequests(clientId: number) {
    return this.prisma.coachingRelationship.findMany({
      where: { clientId, status: 'PENDING' },
      include: {
        coach: {
          select: { id: true, name: true, profilePictureUrl: true },
        },
      },
    });
  }

  async getMyCoach(clientId: number) {
    const relationship = await this.prisma.coachingRelationship.findFirst({
      where: { clientId, status: 'ACCEPTED' },
      include: {
        coach: {
          select: { id: true, name: true, profilePictureUrl: true },
        },
      },
    });
    if (!relationship) return null;
    return { relationshipId: relationship.id, ...relationship.coach };
  }

  // ────────────────────────────────────────────────────────────
  // DASHBOARD COACH — Liste clients SCALABLE
  // ────────────────────────────────────────────────────────────
  //
  // Stratégie :
  //   1. Fetch les relations ACCEPTED + infos utilisateur légères (pas de sessions)
  //   2. Batch query : pour chaque client, compter les sessions 30j,
  //      récupérer la dernière séance, et le programme actif
  //   → Au lieu de charger N×M sessions en mémoire, on fait des queries
  //     ciblées avec des COUNT et TAKE:1
  // ────────────────────────────────────────────────────────────

  async getCoachClients(coachId: number) {
    await this.assertIsCoach(coachId);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Récupérer les relations + infos client légères
    const relationships = await this.prisma.coachingRelationship.findMany({
      where: { coachId, status: 'ACCEPTED' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePictureUrl: true,
            fitnessProfiles: {
              select: {
                goals: true,
                experienceLevel: true,
                trainingFrequency: true,
              },
            },
          },
        },
      },
    });

    const clientIds = relationships.map((r) => r.client.id);
    if (clientIds.length === 0) return [];

    // 2. Récupérer tous les programIds pour ces clients (scalaire, pas de nested relation)
    //    Cela nous servira pour le groupBy qui ne supporte PAS les relations nestées
    const allPrograms = await this.prisma.trainingProgram.findMany({
      where: {
        fitnessProfile: { userId: { in: clientIds } },
      },
      select: {
        id: true,
        name: true,
        status: true,
        fitnessProfile: { select: { userId: true } },
      },
    });

    // Map programId → userId pour agréger par client
    const programToUser = new Map<number, number>();
    allPrograms.forEach((p) => programToUser.set(p.id, p.fitnessProfile.userId));

    const allProgramIds = allPrograms.map((p) => p.id);

    // Batch : compteur de sessions complétées sur 30j
    // groupBy avec filtre scalaire (programId IN [...]) — compatible Prisma
    const recentSessionCounts = allProgramIds.length > 0
      ? await this.prisma.trainingSession.groupBy({
        by: ['programId'],
        where: {
          completed: true,
          performedAt: { gte: thirtyDaysAgo },
          programId: { in: allProgramIds },
        },
        _count: { id: true },
      })
      : [];

    // Batch : total des sessions sur 30j (complétées ou non)
    const totalSessionCounts = allProgramIds.length > 0
      ? await this.prisma.trainingSession.groupBy({
        by: ['programId'],
        where: {
          performedAt: { gte: thirtyDaysAgo },
          programId: { in: allProgramIds },
        },
        _count: { id: true },
      })
      : [];

    // Agréger les counts par userId
    const completedByUser = new Map<number, number>();
    recentSessionCounts.forEach((r) => {
      const uid = programToUser.get(r.programId);
      if (uid !== undefined) {
        completedByUser.set(uid, (completedByUser.get(uid) || 0) + r._count.id);
      }
    });

    const totalByUser = new Map<number, number>();
    totalSessionCounts.forEach((r) => {
      const uid = programToUser.get(r.programId);
      if (uid !== undefined) {
        totalByUser.set(uid, (totalByUser.get(uid) || 0) + r._count.id);
      }
    });

    // Batch : dernière séance complétée pour chaque client
    // On récupère les dernières séances terminées via une query par client
    // Mais groupée en une seule opération via Promise.all
    const lastSessionsPromises = clientIds.map(async (cId) => {
      const session = await this.prisma.trainingSession.findFirst({
        where: {
          completed: true,
          performedAt: { not: null },
          trainingProgram: {
            fitnessProfile: { userId: cId },
          },
        },
        orderBy: { performedAt: 'desc' },
        select: {
          sessionName: true,
          performedAt: true,
        },
      });
      return { cId, session };
    });
    const lastSessions = await Promise.all(lastSessionsPromises);
    const lastSessionByUser = new Map<number, { sessionName: string | null; performedAt: Date | null } | null>(
      lastSessions.map((ls) => [ls.cId, ls.session]),
    );

    // 3. Assembler les résultats
    const activeProgramByUser = new Map(
      allPrograms
        .filter((p) => p.status === 'ACTIVE')
        .map((p) => [
          p.fitnessProfile.userId,
          { id: p.id, name: p.name },
        ]),
    );

    return relationships.map((rel) => {
      const c = rel.client;
      const profile = c.fitnessProfiles;
      const completed30d = completedByUser.get(c.id) || 0;
      const total30d = totalByUser.get(c.id) || 0;
      const lastSession = lastSessionByUser.get(c.id) || null;

      const completionRate =
        total30d > 0 ? Math.round((completed30d / total30d) * 100) : null;

      const daysSinceLastSession = lastSession?.performedAt
        ? Math.floor(
          (Date.now() - new Date(lastSession.performedAt).getTime()) /
          (1000 * 60 * 60 * 24),
        )
        : null;

      return {
        id: c.id,
        relationshipId: rel.id,
        name: c.name,
        email: c.email,
        profilePictureUrl: c.profilePictureUrl,
        goals: profile?.goals || [],
        experienceLevel: profile?.experienceLevel || null,
        trainingFrequency: profile?.trainingFrequency || null,
        activeProgram: activeProgramByUser.get(c.id) || null,
        sessionsLast30Days: completed30d,
        completionRate,
        lastSessionDate: lastSession?.performedAt || null,
        lastSessionName: lastSession?.sessionName || null,
        daysSinceLastSession,
      };
    });
  }

  // ────────────────────────────────────────────────────────────
  // DASHBOARD COACH — Détail d'un client (paginé)
  // ────────────────────────────────────────────────────────────

  async getClientDetail(coachId: number, clientId: number) {
    await this.assertIsCoach(coachId);
    await this.assertCoachClientRelationship(coachId, clientId);

    // Profil + programmes (sans les sessions — chargées séparément)
    const user = await this.prisma.user.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        email: true,
        profilePictureUrl: true,
        createdAt: true,
        fitnessProfiles: {
          select: {
            goals: true,
            experienceLevel: true,
            trainingFrequency: true,
            age: true,
            height: true,
            weight: true,
            gender: true,
            trainingPrograms: {
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                name: true,
                status: true,
                startDate: true,
              },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Client introuvable.');

    // Sessions : uniquement les 50 dernières (paginé, scalable)
    const sessions = await this.prisma.trainingSession.findMany({
      where: {
        trainingProgram: {
          fitnessProfile: { userId: clientId },
        },
      },
      orderBy: { performedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        sessionName: true,
        completed: true,
        performedAt: true,
        date: true,
        duration: true,
        status: true,
        trainingProgram: {
          select: { name: true },
        },
        summary: {
          select: {
            totalSets: true,
            totalReps: true,
            totalVolume: true,
            avgRPE: true,
            duration: true,
            muscleGroups: true,
          },
        },
      },
    });

    // Enrichir les sessions avec le nom du programme
    const enrichedSessions = sessions.map((s) => ({
      id: s.id,
      sessionName: s.sessionName,
      completed: s.completed,
      performedAt: s.performedAt,
      date: s.date,
      duration: s.duration,
      status: s.status,
      programName: s.trainingProgram.name,
      summary: s.summary,
    }));

    return {
      ...user,
      sessions: enrichedSessions,
    };
  }

  // ────────────────────────────────────────────────────────────
  // DASHBOARD COACH — Détail d'une séance spécifique
  // ────────────────────────────────────────────────────────────

  async getClientSessionDetail(
    coachId: number,
    clientId: number,
    sessionId: number,
  ) {
    await this.assertIsCoach(coachId);
    await this.assertCoachClientRelationship(coachId, clientId);

    // Une seule query — filtrage d'appartenance dans le WHERE
    const session = await this.prisma.trainingSession.findFirst({
      where: {
        id: sessionId,
        trainingProgram: {
          fitnessProfile: { userId: clientId },
        },
      },
      select: {
        id: true,
        sessionName: true,
        completed: true,
        performedAt: true,
        duration: true,
        status: true,
        summary: true,
        exercices: {
          select: {
            id: true,
            sets: true,
            reps: true,
            weight: true,
            exercice: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                groupes: {
                  select: {
                    isPrimary: true,
                    groupe: { select: { name: true } },
                  },
                },
              },
            },
            performances: {
              orderBy: { set_index: 'asc' },
              select: {
                set_index: true,
                reps_effectuees: true,
                reps_prevues: true,
                weight: true,
                rpe: true,
                success: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Séance introuvable ou non accessible.');
    }

    return session;
  }
}
