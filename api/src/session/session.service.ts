import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTrainingSessionDto } from './dto/create-session.dto';
import { UpdateSessionDateDto } from './dto/update-session.dto';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { ExerciseDataDto } from 'src/program/dto/add-session-program.dto';
import { ProgramService } from 'src/program/program.service';
import { UsersService } from 'src/users/users.service';
import { ActivityService } from '../social/activity/activity.service';
import { ActivityType } from '@prisma/client';

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly programService: ProgramService,
    private readonly usersService: UsersService,
    private readonly activityService: ActivityService,
  ) { }

  async getSessionById(id: number, userId: number) {
    const session = await this.prisma.trainingSession.findUnique({
      where: { id },
      include: {
        exercices: {
          include: {
            exercice: true,
          },
        },
        trainingProgram: {
          include: {
            fitnessProfile: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    this.programService.verifyPermissions(session.trainingProgram.fitnessProfile.userId, userId, 'cette session');

    return session;
  }

  /**
   * Récupère toutes les sessions d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @param startDate - Date de début (optionnel, pour filtrage par mois)
   * @param endDate - Date de fin (optionnel, pour filtrage par mois)
   * 
   * 🎯 Optimisation : Utiliser startDate/endDate pour charger seulement le mois visible
   *    Exemple: Pour décembre 2024 → startDate = 2024-12-01, endDate = 2024-12-31
   */
  async getAllUserSessions(
    userId: number,
    startDate?: string,
    endDate?: string,
  ) {
    // Construction du filtre de dates
    const dateFilter: any = {};

    if (startDate && endDate) {
      // Filtrer par plage de dates (pour le calendrier)
      dateFilter.OR = [
        {
          // Sessions planifiées (date)
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        {
          // Sessions complétées (performedAt)
          performedAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      ];
    }

    return this.prisma.trainingSession.findMany({
      where: {
        trainingProgram: {
          fitnessProfile: {
            userId,
          },
          status: 'ACTIVE', // Filtrer uniquement les programmes actifs
        },
        ...dateFilter, // Ajouter le filtre de dates si présent
      },
      include: {
        exercices: {
          include: {
            exercice: true,
            performances: true, // Inclure les performances pour afficher les données réelles
          },
        },
        trainingProgram: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async completedSession(id: number, userId: number) {
    const session = await this.prisma.trainingSession.findUnique({
      where: { id },
      include: {
        trainingProgram: {
          include: {
            fitnessProfile: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    if (session.trainingProgram.fitnessProfile.userId !== userId) {
      throw new BadRequestException('You do not have permission to complete this session');
    }

    // Marquer la séance comme complétée
    const updatedSession = await this.prisma.trainingSession.update({
      where: { id },
      data: {
        performedAt: new Date(),
        completed: true
      },
    });

    // Gagner automatiquement 50 XP pour avoir complété la séance (1 fois par jour maximum)
    try {
      // Récupérer la date du dernier gain d'XP
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { lastXpGainDate: true },
      });

      // Obtenir la date du jour (UTC, sans heures)
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      // Vérifier si l'utilisateur a déjà gagné de l'XP aujourd'hui
      let canGainXp = true;

      if (user?.lastXpGainDate) {
        const lastGainDay = new Date(user.lastXpGainDate);
        lastGainDay.setUTCHours(0, 0, 0, 0);

        // Comparer les dates (jour uniquement, pas l'heure)
        canGainXp = today.getTime() > lastGainDay.getTime();
      }

      // Donner XP seulement si c'est la première séance du jour
      if (canGainXp) {
        await this.usersService.gainXp(userId, 50);

        // Mettre à jour la date du dernier gain d'XP
        await this.prisma.user.update({
          where: { id: userId },
          data: { lastXpGainDate: new Date() },
        });
      }

      // Generate Social Activity
      if (updatedSession.completed) {
        await this.activityService.createActivity(
          userId,
          ActivityType.SESSION_COMPLETED,
          {
            sessionId: updatedSession.id,
            sessionName: updatedSession.sessionName || 'Séance sans nom',
            programName: session.trainingProgram.name,
            duration: updatedSession.duration || 0, // Assuming duration is tracked, if not it's 0
          }
        );
      }
    } catch (error) {
      console.error('Erreur lors du gain d\'XP ou activité sociale:', error);
    }

    return updatedSession;
  }

  async updateDate(id: number, updateSessionDateDto: UpdateSessionDateDto) {
    const session = await this.prisma.trainingSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return this.prisma.trainingSession.update({
      where: { id },
      data: { date: new Date(updateSessionDateDto.date) },
    });
  }

  async updateSessionName(id: number, sessionName: string, userId: number) {
    const session = await this.prisma.trainingSession.findUnique({
      where: { id },
      include: {
        trainingProgram: {
          include: {
            fitnessProfile: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    this.programService.verifyPermissions(
      session.trainingProgram.fitnessProfile.userId,
      userId,
      'cette session',
    );

    return this.prisma.trainingSession.update({
      where: { id },
      data: { sessionName },
      include: {
        exercices: {
          include: {
            exercice: true,
          },
        },
      },
    });
  }


  async addExerciseToSession(sessionId: number, exerciceId: number, exerciseData: ExerciseDataDto, userId: number) {
    return this.prisma.$transaction(async (prisma) => {
      const session = await prisma.trainingSession.findUnique({
        where: { id: sessionId },
        include: { exercices: true, trainingProgram: { include: { fitnessProfile: true } } },
      });

      if (!session) {
        throw new BadRequestException('Session introuvable');
      }

      this.programService.verifyPermissions(session.trainingProgram.fitnessProfile.userId, userId, 'cette session');

      if (!exerciseData.id) throw new BadRequestException('ID d\'exercice manquant');

      const exercice = await prisma.exercice.findUnique({
        where: { id: exerciceId },
      });

      if (!exercice) {
        throw new BadRequestException('Exercice introuvable');
      }

      await prisma.exerciceSession.create({
        data: {
          sessionId,
          exerciceId: exercice.id,
          sets: exerciseData.sets ?? 3,
          reps: exerciseData.reps ?? 8,
          weight: exerciseData.weight ?? 0,
        },
      });

      return prisma.trainingProgram.findUnique({
        where: { id: session.programId },
        include: { sessions: { include: { exercices: true } } },
      });
    });
  }

  async deleteExerciseFromSession(sessionId: number, exerciceId: number, userId: number) {
    return this.prisma.$transaction(async (prisma) => {
      const session = await prisma.trainingSession.findUnique({
        where: { id: sessionId },
        include: {
          exercices: true, trainingProgram: {
            include: { fitnessProfile: true },
          },
        },
      });


      if (!session) {
        throw new BadRequestException('Session introuvable')
      }

      this.programService.verifyPermissions(session.trainingProgram.fitnessProfile.userId, userId, 'cette session');

      await prisma.exerciceSession.delete({
        where: {
          sessionId_exerciceId: {
            sessionId,
            exerciceId,
          },
        },
      });

      return prisma.trainingProgram.findUnique({
        where: { id: session.programId },
        include: { sessions: { include: { exercices: true } } },
      });
    });
  }


  async updateExerciceFromSession(sessionId: number, exerciceId: number, exerciseData: ExerciseDataDto, userId: number) {
    return this.prisma.$transaction(async (prisma) => {
      const session = await prisma.trainingSession.findUnique({
        where: { id: sessionId },
        include: {
          trainingProgram: {
            include: { fitnessProfile: true },
          },
        },
      });

      if (!session) {
        throw new BadRequestException('Session introuvable');
      }

      this.programService.verifyPermissions(session.trainingProgram.fitnessProfile.userId, userId, 'cette session');

      const exercice = await prisma.exerciceSession.findUnique({
        where: {
          sessionId_exerciceId: {
            sessionId,
            exerciceId,
          },
        },
      });

      if (!exercice) {
        throw new BadRequestException('Exercice introuvable');
      }

      await prisma.exerciceSession.update({
        where: {
          sessionId_exerciceId: {
            sessionId,
            exerciceId,
          },
        },
        data: {
          reps: exerciseData.reps,
          sets: exerciseData.sets,
          weight: exerciseData.weight ?? exercice.weight,
        },
      });

      return prisma.trainingSession.findUnique({
        where: { id: sessionId },
        include: { exercices: true },
      });
    });
  }

}
