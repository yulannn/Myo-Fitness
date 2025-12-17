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
import { BadgeCheckerService } from '../badge/badge-checker.service';

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly programService: ProgramService,
    private readonly usersService: UsersService,
    private readonly activityService: ActivityService,
    private readonly badgeCheckerService: BadgeCheckerService,
  ) { }

  /**
   * 🎯 OPTIMISÉ: Récupère une session par ID avec seulement les données nécessaires
   */
  async getSessionById(id: number, userId: number) {
    // D'abord récupérer seulement les infos pour vérifier les permissions
    const sessionWithProgram = await this.prisma.trainingSession.findUnique({
      where: { id },
      select: {
        trainingProgram: {
          select: {
            fitnessProfile: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!sessionWithProgram) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    this.programService.verifyPermissions(
      sessionWithProgram.trainingProgram.fitnessProfile.userId,
      userId,
      'cette session'
    );

    // Ensuite récupérer les données complètes optimisées
    const session = await this.prisma.trainingSession.findUnique({
      where: { id },
      select: {
        id: true,
        completed: true,
        sessionName: true,
        date: true,
        performedAt: true,
        duration: true,
        exercices: {
          select: {
            id: true,
            exerciceId: true, // ✅ Ajouté pour le frontend
            sets: true,
            reps: true,
            weight: true,
            exercice: {
              select: {
                name: true,
              },
            },
            performances: {
              select: {
                set_index: true,
                reps_effectuees: true,
                weight: true,
                rpe: true,
                success: true,
              },
            },
          },
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

    return session;
  }

  /**
   * 🚀 ULTRA-OPTIMISÉ: Endpoint pour le calendrier
   * Retourne uniquement les données minimales nécessaires pour l'affichage calendrier
   */
  async getSessionsForCalendar(
    userId: number,
    startDate?: string,
    endDate?: string,
  ) {
    const dateFilter: any = {};

    if (startDate && endDate) {
      dateFilter.OR = [
        {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        {
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
          status: 'ACTIVE',
        },
        ...dateFilter,
      },
      select: {
        id: true,
        date: true,
        performedAt: true,
        completed: true,
        sessionName: true,
        trainingProgram: {
          select: {
            name: true,
          },
        },
        summary: {
          select: {
            duration: true,
            totalVolume: true,
            totalSets: true,
            muscleGroups: true,
          },
        },
        _count: {
          select: {
            exercices: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  /**
   * Récupère toutes les sessions d'un utilisateur
   * ✅ OPTIMISÉ: Utilise select pour charger uniquement les données nécessaires
   * Utilisé par: Home (PersonalRecords, StreakTracker, AIInsights, WeekCalendarPreview)
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
      select: {
        id: true,
        completed: true,
        performedAt: true,
        date: true,
        createdAt: true,
        // Exercices avec données minimales (pour PersonalRecords)
        exercices: {
          select: {
            id: true,
            exerciceId: true, // ✅ Ajouté pour le frontend
            exercice: {
              select: {
                id: true,
                name: true, // Nécessaire pour PersonalRecords
              }
            },
            // Performances nécessaires pour calculer les PR
            performances: {
              select: {
                id_set: true,
                weight: true,
                reps_effectuees: true,
              }
            }
          }
        }
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async completedSession(id: number, userId: number) {
    // 1️⃣ Récupérer et valider la session (en dehors de la transaction pour performance)
    const session = await this.prisma.trainingSession.findUnique({
      where: { id },
      include: {
        trainingProgram: {
          include: {
            fitnessProfile: true,
          },
        },
        exercices: {
          include: {
            exercice: {
              include: {
                groupes: {
                  include: {
                    groupe: true,
                  },
                },
              },
            },
            performances: true,
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

    // 2️⃣ ✅ TRANSACTION ATOMIQUE pour éviter les race conditions
    const result = await this.prisma.$transaction(async (tx) => {
      // Marquer la séance comme complétée
      const updatedSession = await tx.trainingSession.update({
        where: { id },
        data: {
          performedAt: new Date(),
          completed: true
        },
      });

      // 📊 Créer le résumé de la session
      await this.createSessionSummary(session, tx);

      // 💰 Gain d'XP atomique (1 fois par jour max)
      try {
        // Récupérer l'user avec XP actuel
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: {
            lastXpGainDate: true,
            xp: true,
            level: true,
          },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        // Calculer si on peut gagner de l'XP aujourd'hui
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        let canGainXp = true;
        if (user.lastXpGainDate) {
          const lastGainDay = new Date(user.lastXpGainDate);
          lastGainDay.setUTCHours(0, 0, 0, 0);
          canGainXp = today.getTime() > lastGainDay.getTime();
        }

        // ✅ Donner XP seulement si c'est la première séance du jour
        if (canGainXp) {
          const XP_PER_LEVEL = 200;
          const XP_GAIN = 50;

          const newTotalXp = user.xp + XP_GAIN;
          const newLevel = Math.floor(newTotalXp / XP_PER_LEVEL) + 1;

          // ✅ Tout en UNE SEULE opération atomique
          await tx.user.update({
            where: { id: userId },
            data: {
              xp: newTotalXp,
              level: newLevel,
              lastXpGainDate: new Date(),
            },
          });
        }

        // 📱 Générer l'activité sociale
        if (updatedSession.completed) {
          await this.activityService.createActivity(
            userId,
            ActivityType.SESSION_COMPLETED,
            {
              sessionId: updatedSession.id,
              sessionName: updatedSession.sessionName || 'Séance sans nom',
              programName: session.trainingProgram.name,
              duration: updatedSession.duration || 0,
            },
            tx // ✅ Passer la transaction
          );
        }
      } catch (error) {
        console.error('Erreur lors du gain d\'XP ou activité sociale:', error);
        // ⚠️ On laisse l'erreur remonter pour rollback la transaction
        throw error;
      }

      return updatedSession;
    });

    // 🏆 Vérifier les badges et retourner ceux qui sont débloqués
    let unlockedBadges: any[] = [];
    try {
      unlockedBadges = await this.checkBadgesAfterSession(userId, id);
    } catch (error) {
      console.error('Erreur lors de la vérification des badges:', error);
      // On ne fait pas échouer la requête si les badges échouent
    }

    return {
      ...result,
      unlockedBadges, // ✨ Retourner les badges débloqués
    };
  }

  /**
   * 🏆 Vérifie et débloque tous les badges liés à une session complétée
   * Retourne la liste des badges nouvellement débloqués
   */
  private async checkBadgesAfterSession(userId: number, sessionId: number): Promise<any[]> {
    const allUnlockedBadges: any[] = [];

    try {
      // Vérifier les badges de session
      const sessionBadges = await this.badgeCheckerService.checkSessionBadges(userId, sessionId);
      allUnlockedBadges.push(...sessionBadges);

      // Vérifier les badges de volume
      const volumeBadges = await this.badgeCheckerService.checkVolumeBadges(userId);
      allUnlockedBadges.push(...volumeBadges);

      // Vérifier le badge "Semaine Parfaite"
      const perfectWeekBadge = await this.badgeCheckerService.checkPerfectWeekBadge(userId);
      if (perfectWeekBadge) {
        allUnlockedBadges.push(perfectWeekBadge);
      }
    } catch (error) {
      console.error(
        `Erreur lors de la vérification des badges pour la session ${sessionId}:`,
        error,
      );
    }

    return allUnlockedBadges;
  }

  /**
   * 📊 Créer un résumé de session pour optimiser l'affichage calendrier
   */
  private async createSessionSummary(session: any, tx?: any) {
    try {
      // Utiliser la transaction si fournie, sinon prisma normal
      const prisma = tx || this.prisma;

      let totalSets = 0;
      let totalReps = 0;
      let totalVolume = 0;
      let totalRPE = 0;
      let rpeCount = 0;
      const muscleGroupsSet = new Set<string>();

      // Parcourir tous les exercices
      session.exercices.forEach((ex: any) => {
        // Compter les séries
        totalSets += ex.sets || 0;

        // Si des performances existent, les utiliser
        if (ex.performances && ex.performances.length > 0) {
          ex.performances.forEach((perf: any) => {
            totalReps += perf.reps_effectuees || 0;
            totalVolume += (perf.reps_effectuees || 0) * (perf.weight || 0);
            if (perf.rpe) {
              totalRPE += perf.rpe;
              rpeCount++;
            }
          });
        } else {
          // Sinon utiliser les données planifiées
          totalReps += (ex.sets || 0) * (ex.reps || 0);
          totalVolume += (ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0);
        }

        // Collecter les groupes musculaires
        if (ex.exercice?.groupes) {
          ex.exercice.groupes.forEach((g: any) => {
            if (g.groupe?.name) {
              muscleGroupsSet.add(g.groupe.name.toLowerCase());
            }
          });
        }
      });

      // Calculer la moyenne RPE
      const avgRPE = rpeCount > 0 ? totalRPE / rpeCount : null;

      // Créer ou mettre à jour le résumé
      await prisma.sessionSummary.upsert({
        where: { sessionId: session.id },
        create: {
          sessionId: session.id,
          totalSets,
          totalReps,
          totalVolume,
          avgRPE,
          duration: session.duration,
          muscleGroups: Array.from(muscleGroupsSet),
        },
        update: {
          totalSets,
          totalReps,
          totalVolume,
          avgRPE,
          duration: session.duration,
          muscleGroups: Array.from(muscleGroupsSet),
        },
      });
    } catch (error) {
      console.error('Erreur lors de la création du résumé de session:', error);
    }
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
