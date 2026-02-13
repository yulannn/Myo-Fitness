import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCoachingRequestDto } from './dto/create-coaching-request.dto';
import { RespondCoachingRequestDto } from './dto/respond-coaching-request.dto';
import { CoachingStatus } from '@prisma/client';

@Injectable()
export class CoachingService {
  constructor(private prisma: PrismaService) { }

  /**
   * Un coach envoie une demande de suivi à un pratiquant via son friendCode
   */
  async createRequest(coachId: number, dto: CreateCoachingRequestDto) {
    const { uniqueCode } = dto;

    // 1. Vérifier que le demandeur est bien un coach
    const coach = await this.prisma.user.findUnique({
      where: { id: coachId },
    });

    if (!coach) {
      throw new NotFoundException('Coach introuvable.');
    }

    if (coach.role !== 'COACH') {
      throw new ForbiddenException('Seuls les comptes Coach peuvent envoyer des demandes de suivi.');
    }

    // 2. Trouver le client par son code ami
    const client = await this.prisma.user.findUnique({
      where: { friendCode: uniqueCode },
    });

    if (!client) {
      throw new NotFoundException(`Aucun utilisateur trouvé avec le code ${uniqueCode}.`);
    }

    if (client.id === coachId) {
      throw new BadRequestException('Vous ne pouvez pas vous coacher vous-même.');
    }

    // 3. Vérifier si une relation existe déjà
    const existing = await this.prisma.coachingRelationship.findUnique({
      where: {
        coachId_clientId: {
          coachId,
          clientId: client.id,
        },
      },
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        throw new BadRequestException('Cet utilisateur est déjà votre client.');
      }
      if (existing.status === 'PENDING') {
        throw new BadRequestException('Une demande est déjà en attente pour cet utilisateur.');
      }
      // Si REJECTED, on permet de renvoyer une demande (on met à jour)
      return this.prisma.coachingRelationship.update({
        where: { id: existing.id },
        data: { status: 'PENDING' },
      });
    }

    // 4. Créer la relation
    return this.prisma.coachingRelationship.create({
      data: {
        coachId,
        clientId: client.id,
        status: 'PENDING',
      },
    });
  }

  /**
   * Le pratiquant accepte ou refuse la demande
   */
  async respondToRequest(clientId: number, dto: RespondCoachingRequestDto) {
    const { requestId, status } = dto;

    const relationship = await this.prisma.coachingRelationship.findUnique({
      where: { id: requestId },
    });

    if (!relationship) {
      throw new NotFoundException('Demande de coaching introuvable.');
    }

    if (relationship.clientId !== clientId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à répondre à cette demande.');
    }

    return this.prisma.coachingRelationship.update({
      where: { id: requestId },
      data: { status },
    });
  }

  /**
   * Le coach récupère la liste de ses clients acceptés
   */
  async getCoachClients(coachId: number) {
    const relationships = await this.prisma.coachingRelationship.findMany({
      where: {
        coachId,
        status: 'ACCEPTED',
      },
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
                trainingPrograms: {
                  select: {
                    sessions: {
                      where: { completed: true },
                      orderBy: { performedAt: 'desc' },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return relationships.map((rel) => {
      const client = rel.client;
      // Extraire la toute dernière séance (peu importe le programme)
      const allSessions = client.fitnessProfiles?.trainingPrograms.flatMap(p => p.sessions) || [];
      const lastSession = allSessions.sort((a, b) =>
        (b.performedAt?.getTime() || 0) - (a.performedAt?.getTime() || 0)
      )[0] || null;

      return {
        id: client.id,
        relationshipId: rel.id,
        name: client.name,
        email: client.email,
        profilePictureUrl: client.profilePictureUrl,
        goals: client.fitnessProfiles?.goals || [],
        lastSessionDate: lastSession?.performedAt || null,
        lastSessionName: lastSession?.sessionName || null,
      };
    });
  }

  /**
   * Le client récupère ses demandes en attente
   */
  async getPendingRequests(clientId: number) {
    return this.prisma.coachingRelationship.findMany({
      where: {
        clientId,
        status: 'PENDING',
      },
      include: {
        coach: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true,
          },
        },
      },
    });
  }

  /**
   * Le client récupère son coach actuel
   */
  async getMyCoach(clientId: number) {
    const relationship = await this.prisma.coachingRelationship.findFirst({
      where: {
        clientId,
        status: 'ACCEPTED',
      },
      include: {
        coach: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    if (!relationship) return null;

    return {
      relationshipId: relationship.id,
      ...relationship.coach,
    };
  }

  /**
   * Rompre une relation de coaching (Coach ou Client)
   */
  async terminateRelationship(userId: number, relationshipId: number) {
    const relationship = await this.prisma.coachingRelationship.findUnique({
      where: { id: relationshipId },
    });

    if (!relationship) {
      throw new NotFoundException('Relation de coaching introuvable.');
    }

    // Sécurité : Seuls le coach ou le client concernés peuvent supprimer
    if (relationship.coachId !== userId && relationship.clientId !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à rompre cette relation.');
    }

    return this.prisma.coachingRelationship.delete({
      where: { id: relationshipId },
    });
  }
}
