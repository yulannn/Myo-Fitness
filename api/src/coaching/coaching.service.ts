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
  private async assertCoachClientRelationship(
    coachId: number,
    clientId: number,
  ) {
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
      throw new BadRequestException(
        'Vous ne pouvez pas vous coacher vous-même.',
      );
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
    allPrograms.forEach((p) =>
      programToUser.set(p.id, p.fitnessProfile.userId),
    );

    const allProgramIds = allPrograms.map((p) => p.id);

    // Batch : compteur de sessions complétées sur 30j
    // groupBy avec filtre scalaire (programId IN [...]) — compatible Prisma
    const recentSessionCounts =
      allProgramIds.length > 0
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
    const totalSessionCounts =
      allProgramIds.length > 0
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
    const lastSessionByUser = new Map<
      number,
      { sessionName: string | null; performedAt: Date | null } | null
    >(lastSessions.map((ls) => [ls.cId, ls.session]));

    // 3. Assembler les résultats
    const activeProgramByUser = new Map(
      allPrograms
        .filter((p) => p.status === 'ACTIVE')
        .map((p) => [p.fitnessProfile.userId, { id: p.id, name: p.name }]),
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
              where: { status: 'ACTIVE' },
              take: 1,
              select: {
                id: true,
                name: true,
                status: true,
                startDate: true,
                sessionTemplates: {
                  orderBy: { orderInProgram: 'asc' },
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    orderInProgram: true,
                    exercises: {
                      orderBy: { orderInSession: 'asc' },
                      select: {
                        id: true,
                        sets: true,
                        reps: true,
                        weight: true,
                        duration: true,
                        orderInSession: true,
                        exercise: {
                          select: {
                            id: true,
                            name: true,
                            imageUrl: true,
                            type: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Client introuvable.');

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

  /**
   * Modifier un exercice dans un template (Coach)
   */
  async updateExerciseTemplate(
    coachId: number,
    clientId: number,
    exerciseTemplateId: number,
    data: { sets?: number; reps?: number; weight?: number; duration?: number },
  ) {
    await this.assertIsCoach(coachId);
    await this.assertCoachClientRelationship(coachId, clientId);

    const template = await this.prisma.exerciseTemplate.findUnique({
      where: { id: exerciseTemplateId },
      include: {
        sessionTemplate: {
          include: { trainingProgram: true },
        },
        exercise: true,
      },
    });

    if (!template) throw new NotFoundException('Exercice introuvable.');

    const beforeState = {
      id: exerciseTemplateId,
      sets: template.sets,
      reps: template.reps,
      weight: template.weight,
      duration: template.duration,
    };

    return this.prisma.$transaction(async (tx) => {
      const lastDiff = template.exercise.type === 'CARDIO'
        ? `${template.duration || 0}m -> ${data.duration || template.duration}m`
        : `${template.sets}x${template.reps}${template.weight ? ` @${template.weight}kg` : ''} -> ${data.sets || template.sets}x${data.reps || template.reps}${data.weight !== undefined ? (data.weight ? ` @${data.weight}kg` : '') : (template.weight ? ` @${template.weight}kg` : '')}`;

      const updated = await tx.exerciseTemplate.update({
        where: { id: exerciseTemplateId },
        data: {
          ...data,
          hasCoachUpdate: true,
          lastDiff,
        },
      });

      const mod = await tx.programModification.create({
        data: {
          programId: template.sessionTemplate.programId,
          coachId,
          type: 'EXERCISE_UPDATED',
          beforeState,
          afterState: { id: exerciseTemplateId, ...data },
          description: `Modification de ${template.exercise.name} : ${data.sets || template.sets} sets, ${data.reps || template.reps} reps`,
        },
      });

      // Créer une activité pour le client
      await tx.activity.create({
        data: {
          userId: clientId,
          type: 'COACH_MODIFICATION',
          data: {
            modificationId: mod.id,
            coachName: (
              await tx.user.findUnique({
                where: { id: coachId },
                select: { name: true },
              })
            )?.name,
            description: mod.description,
          },
        },
      });

      // Marquer le template comme ayant une mise à jour du coach
      await tx.sessionTemplate.update({
        where: { id: template.sessionTemplateId },
        data: { hasCoachUpdate: true },
      });

      return updated;
    });
  }

  /**
   * Ajouter un exercice à un template (Coach)
   */
  async addExerciseToTemplate(
    coachId: number,
    clientId: number,
    sessionTemplateId: number,
    exerciseId: number,
    data: { sets?: number; reps?: number; weight?: number; duration?: number },
  ) {
    await this.assertIsCoach(coachId);
    await this.assertCoachClientRelationship(coachId, clientId);

    const sessionTemplate = await this.prisma.sessionTemplate.findUnique({
      where: { id: sessionTemplateId },
      include: { exercises: true },
    });

    if (!sessionTemplate)
      throw new NotFoundException('Template de séance introuvable.');

    const exercise = await this.prisma.exercice.findUnique({
      where: { id: exerciseId },
    });
    if (!exercise) throw new NotFoundException('Exercice introuvable.');

    const maxOrder = sessionTemplate.exercises.reduce(
      (max, ex) => Math.max(max, ex.orderInSession),
      -1,
    );

    return this.prisma.$transaction(async (tx) => {
      const created = await tx.exerciseTemplate.create({
        data: {
          sessionTemplateId,
          exerciseId,
          sets: data.sets ?? 3,
          reps: data.reps ?? 10,
          weight: data.weight ?? 0,
          duration: data.duration,
          orderInSession: maxOrder + 1,
          hasCoachUpdate: true,
          lastDiff: 'Nouvel exercice !',
        },
      });

      const mod = await tx.programModification.create({
        data: {
          programId: sessionTemplate.programId,
          coachId,
          type: 'EXERCISE_ADDED',
          afterState: created,
          description: `Ajout de l'exercice ${exercise.name} à la séance ${sessionTemplate.name}`,
        },
      });

      await tx.activity.create({
        data: {
          userId: clientId,
          type: 'COACH_MODIFICATION',
          data: {
            modificationId: mod.id,
            coachName: (
              await tx.user.findUnique({
                where: { id: coachId },
                select: { name: true },
              })
            )?.name,
            description: mod.description,
          },
        },
      });

      // Marquer le template comme ayant une mise à jour du coach
      await tx.sessionTemplate.update({
        where: { id: sessionTemplateId },
        data: { hasCoachUpdate: true },
      });

      return created;
    });
  }

  /**
   * Supprimer un exercice d'un template (Coach)
   */
  async removeExerciseFromTemplate(
    coachId: number,
    clientId: number,
    exerciseTemplateId: number,
  ) {
    await this.assertIsCoach(coachId);
    await this.assertCoachClientRelationship(coachId, clientId);

    const template = await this.prisma.exerciseTemplate.findUnique({
      where: { id: exerciseTemplateId },
      include: {
        sessionTemplate: true,
        exercise: true,
      },
    });

    if (!template) throw new NotFoundException('Exercice introuvable.');

    return this.prisma.$transaction(async (tx) => {
      const mod = await tx.programModification.create({
        data: {
          programId: template.sessionTemplate.programId,
          coachId,
          type: 'EXERCISE_REMOVED',
          beforeState: template,
          description: `Suppression de l'exercice ${template.exercise.name} de la séance ${template.sessionTemplate.name}`,
        },
      });

      await tx.exerciseTemplate.delete({ where: { id: exerciseTemplateId } });

      await tx.activity.create({
        data: {
          userId: clientId,
          type: 'COACH_MODIFICATION',
          data: {
            modificationId: mod.id,
            coachName: (
              await tx.user.findUnique({
                where: { id: coachId },
                select: { name: true },
              })
            )?.name,
            description: mod.description,
          },
        },
      });

      // Réordonner
      const remaining = await tx.exerciseTemplate.findMany({
        where: { sessionTemplateId: template.sessionTemplateId },
        orderBy: { orderInSession: 'asc' },
      });

      for (let i = 0; i < remaining.length; i++) {
        await tx.exerciseTemplate.update({
          where: { id: remaining[i].id },
          data: { orderInSession: i },
        });
      }

      // Marquer le template comme ayant une mise à jour du coach
      await tx.sessionTemplate.update({
        where: { id: template.sessionTemplateId },
        data: { hasCoachUpdate: true },
      });

      return { success: true };
    });
  }

  /**
   * Récupérer les modifications d'un programme
   */
  async getProgramModifications(userId: number, programId: number) {
    const program = await this.prisma.trainingProgram.findUnique({
      where: { id: programId },
      include: { fitnessProfile: true },
    });

    if (!program) throw new NotFoundException('Programme introuvable.');

    // Sécurité: Proprio ou son coach
    if (program.fitnessProfile.userId !== userId) {
      await this.assertCoachClientRelationship(
        userId,
        program.fitnessProfile.userId,
      );
    }

    return this.prisma.programModification.findMany({
      where: { programId },
      include: {
        coach: { select: { name: true, profilePictureUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Annuler une modification (Revert)
   */
  async revertModification(userId: number, modificationId: number) {
    const mod = await this.prisma.programModification.findUnique({
      where: { id: modificationId },
      include: {
        program: {
          include: { fitnessProfile: true },
        },
      },
    });

    if (!mod) throw new NotFoundException('Modification introuvable.');

    // Sécurité: Proprio ou son coach
    if (mod.program.fitnessProfile.userId !== userId) {
      await this.assertCoachClientRelationship(
        userId,
        mod.program.fitnessProfile.userId,
      );
    }

    if (mod.isReverted)
      throw new BadRequestException('Cette modification a déjà été annulée.');

    return this.prisma.$transaction(async (tx) => {
      if (mod.type === 'EXERCISE_UPDATED') {
        const before = mod.beforeState as any;
        const { id, ...updateData } = before;
        await tx.exerciseTemplate.update({
          where: { id },
          data: updateData,
        });
      } else if (mod.type === 'EXERCISE_ADDED') {
        const after = mod.afterState as any;
        await tx.exerciseTemplate.delete({
          where: { id: after.id },
        });
      } else if (mod.type === 'EXERCISE_REMOVED') {
        const before = mod.beforeState as any;
        await tx.exerciseTemplate.create({
          data: {
            sessionTemplateId: before.sessionTemplateId,
            exerciseId: before.exerciseId,
            sets: before.sets,
            reps: before.reps,
            weight: before.weight,
            duration: before.duration,
            orderInSession: before.orderInSession,
            notes: before.notes,
          },
        });
      }

      await tx.programModification.update({
        where: { id: modificationId },
        data: { isReverted: true },
      });

      return { success: true };
    });
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

  /**
   * Assigner une nouvelle séance à un client (l'ajoute à son programme actif)
   */
  async assignSessionToClient(
    coachId: number,
    clientId: number,
    sessionData: any, // On utilisera le même DTO que ProgramService
  ) {
    await this.assertIsCoach(coachId);
    await this.assertCoachClientRelationship(coachId, clientId);

    // 1. Trouver le programme actif du client
    const activeProgram = await this.prisma.trainingProgram.findFirst({
      where: {
        fitnessProfile: { userId: clientId },
        status: 'ACTIVE',
      },
      select: { id: true },
    });

    if (!activeProgram) {
      throw new BadRequestException(
        "Le client n'a pas de programme actif. Impossible d'assigner une séance.",
      );
    }

    // 2. Créer la séance via Prisma (logique similaire à ProgramService.addSessionToProgram)
    return this.prisma.$transaction(async (tx) => {
      const session = await tx.trainingSession.create({
        data: {
          programId: activeProgram.id,
          sessionName: sessionData.name || 'Séance Coach',
          completed: false,
          status: 'SCHEDULED',
          date: new Date(), // Par défaut aujourd'hui ou date prévue si fournie
        },
      });

      if (sessionData.exercises && sessionData.exercises.length > 0) {
        for (const ex of sessionData.exercises) {
          await tx.exerciceSession.create({
            data: {
              sessionId: session.id,
              exerciceId: ex.id,
              sets: ex.sets || 3,
              reps: ex.reps || 10,
              weight: ex.weight || 0,
            },
          });
        }
      }

      return session;
    });
  }

  /**
   * Créer une séance "maître" pour le coach (réutilisable)
   */
  async createCoachSession(coachId: number, sessionData: any) {
    await this.assertIsCoach(coachId);

    // 1. Trouver ou créer le programme "Bibliothèque Coach" pour ce coach
    let coachProgram = await this.prisma.trainingProgram.findFirst({
      where: {
        fitnessProfile: { userId: coachId },
        name: 'Ma Bibliothèque de Séances',
      },
      select: { id: true },
    });

    if (!coachProgram) {
      // S'assurer qu'il a un profil fitness
      let fitnessProfile = await this.prisma.fitnessProfile.findUnique({
        where: { userId: coachId },
      });

      if (!fitnessProfile) {
        fitnessProfile = await this.prisma.fitnessProfile.create({
          data: {
            userId: coachId,
            age: 30, // Valeurs par défaut
            height: 175,
            weight: 70,
            trainingFrequency: 3,
            experienceLevel: 'INTERMEDIATE',
            gender: 'OTHER',
          },
        });
      }

      coachProgram = await this.prisma.trainingProgram.create({
        data: {
          name: 'Ma Bibliothèque de Séances',
          fitnessProfileId: fitnessProfile.id,
          status: 'DRAFT',
        },
      });
    }

    // 2. Créer le template de séance
    return this.prisma.$transaction(async (tx) => {
      const template = await tx.sessionTemplate.create({
        data: {
          programId: coachProgram.id,
          name: sessionData.name || 'Séance sans nom',
          description: sessionData.description || '',
          orderInProgram: 0,
        },
      });

      if (sessionData.exercises && sessionData.exercises.length > 0) {
        for (let i = 0; i < sessionData.exercises.length; i++) {
          const ex = sessionData.exercises[i];
          await tx.exerciseTemplate.create({
            data: {
              sessionTemplateId: template.id,
              exerciseId: ex.id,
              sets: ex.sets || 3,
              reps: ex.reps || 10,
              weight: ex.weight || 0,
              orderInSession: i,
            },
          });
        }
      }

      return tx.sessionTemplate.findUnique({
        where: { id: template.id },
        include: {
          exercises: {
            include: { exercise: true },
          },
        },
      });
    });
  }

  /**
   * Récupérer la bibliothèque de séances du coach
   */
  async getCoachLibrary(coachId: number) {
    await this.assertIsCoach(coachId);

    const coachProgram = await this.prisma.trainingProgram.findFirst({
      where: {
        fitnessProfile: { userId: coachId },
        name: 'Ma Bibliothèque de Séances',
      },
      include: {
        sessionTemplates: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { orderInSession: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return coachProgram?.sessionTemplates || [];
  }

  /**
   * Marquer un template de séance comme "vu" par le client (supprime l'indicateur)
   */
  async acknowledgeSessionUpdate(userId: number, sessionTemplateId: number) {
    const template = await this.prisma.sessionTemplate.findUnique({
      where: { id: sessionTemplateId },
      include: { trainingProgram: { include: { fitnessProfile: true } } },
    });

    if (!template) throw new NotFoundException('Template introuvable.');

    // Sécurité: Seul le client propriétaire du programme peut accuser réception
    if (template.trainingProgram.fitnessProfile.userId !== userId) {
      throw new ForbiddenException(
        "Vous n'avez pas l'autorisation de modifier ce programme.",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Nettoyer tous les flags d'exercices de cette séance
      await tx.exerciseTemplate.updateMany({
        where: { sessionTemplateId },
        data: { hasCoachUpdate: false, lastDiff: null },
      });

      return tx.sessionTemplate.update({
        where: { id: sessionTemplateId },
        data: { hasCoachUpdate: false },
      });
    });
  }
}
