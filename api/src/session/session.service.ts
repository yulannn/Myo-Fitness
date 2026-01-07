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
import { BodyAtlasService } from '../body-atlas/body-atlas.service';

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly programService: ProgramService,
    private readonly usersService: UsersService,
    private readonly activityService: ActivityService,
    private readonly badgeCheckerService: BadgeCheckerService,
    private readonly bodyAtlasService: BodyAtlasService,
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
                type: true, // 🆕 Pour distinguer cardio
                imageUrl: true, // ✅ Ajouté pour le frontend
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
        // 🆕 Ajouter le template pour les sessions non complétées (lazy loading)
        sessionTemplate: {
          select: {
            name: true,
            exercises: {
              select: {
                exerciseId: true,
                sets: true,
                reps: true,
                weight: true,
                duration: true, // 🆕 Pour cardio
                orderInSession: true,
                exercise: {
                  select: {
                    id: true,
                    name: true,
                    type: true, // 🆕 Pour distinguer cardio
                    imageUrl: true, // ✅ Ajouté pour le frontend
                  },
                },
              },
              orderBy: {
                orderInSession: 'asc',
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
            caloriesBurned: true,
          },
        },
      },
    });

    return session;
  }

  /**
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
        // 🆕 Ajouter le template pour vérifier s'il y a des exercices (sessions non complétées)
        sessionTemplate: {
          select: {
            _count: {
              select: {
                exercises: true,
              },
            },
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
    // 1️ Récupérer et valider la session (en dehors de la transaction pour performance)
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

    const result = await this.prisma.$transaction(async (tx) => {
      // Marquer la séance comme complétée
      const updatedSession = await tx.trainingSession.update({
        where: { id },
        data: {
          performedAt: new Date(),
          completed: true,
          status: 'COMPLETED', // 🆕 Nouveau statut
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

        //  Donner XP seulement si c'est la première séance du jour
        if (canGainXp) {
          const XP_PER_LEVEL = 200;
          const XP_GAIN = 50;

          const newTotalXp = user.xp + XP_GAIN;
          const newLevel = Math.floor(newTotalXp / XP_PER_LEVEL) + 1;

          //  Tout en UNE SEULE opération atomique
          await tx.user.update({
            where: { id: userId },
            data: {
              xp: newTotalXp,
              level: newLevel,
              lastXpGainDate: new Date(),
            },
          });
        }

        //  Générer l'activité sociale
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
        //  On laisse l'erreur remonter pour rollback la transaction
        throw error;
      }

      return updatedSession;
    });

    // 🔥 Recharger la session avec le summary pour inclure les calories brûlées
    const sessionWithSummary = await this.prisma.trainingSession.findUnique({
      where: { id },
      include: {
        summary: true,
        exercices: {
          include: {
            exercice: true,
            performances: true,
          },
        },
        trainingProgram: true,
      },
    });

    //  Vérifier les badges et retourner ceux qui sont débloqués
    let unlockedBadges: any[] = [];
    try {
      unlockedBadges = await this.checkBadgesAfterSession(userId, id);

      // 🆕 Créer une activité pour chaque badge débloqué
      for (const unlocked of unlockedBadges) {
        // unlocked est un UserBadge qui inclut le Badge
        // Si structure différente (ex: mock ou changement), on fallback safe
        const badgeData = unlocked.badge || unlocked;

        await this.activityService.createActivity(
          userId,
          ActivityType.BADGE_UNLOCKED,
          {
            badgeId: badgeData.id,
            badgeName: badgeData.name,
            badgeIcon: badgeData.iconUrl,
            badgeCode: badgeData.code,
          }
        );
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des badges:', error);
      // On ne fait pas échouer la requête si les badges échouent
    }

    //  Mettre à jour les stats musculaires du Body Atlas
    try {
      await this.bodyAtlasService.updateMuscleStats(userId, id);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des stats musculaires:', error);
      // On ne fait pas échouer la requête si la mise à jour échoue
    }

    // 🆕 Vérifier les records personnels (PR)
    try {
      await this.checkPersonalRecords(sessionWithSummary, userId);
    } catch (error) {
      console.error('Erreur lors de la vérification des PRs:', error);
    }

    return {
      ...sessionWithSummary,
      unlockedBadges, //  Retourner les badges débloqués
    };
  }

  /**
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
   * Vérifie et crée des activités pour les records personnels
   */
  private async checkPersonalRecords(session: any, userId: number) {
    if (!session.exercices) return;

    for (const exercise of session.exercices) {
      // Ignorer si pas de performances ou exercice cardio (pour l'instant basé sur poids)
      if (!exercise.performances || exercise.performances.length === 0) continue;
      if (exercise.exercice.type === 'CARDIO') continue;

      // Calculer le max poids validé dans cette session
      const maxWeightSession = Math.max(
        ...exercise.performances
          .filter((p: any) => p.success)
          .map((p: any) => p.weight || 0)
      );

      if (maxWeightSession <= 0) continue;

      // Chercher le record précédent
      // On cherche la meilleure performance passée pour cet exercice
      // ⚠️ Optimisation: Idéalement il faudrait une table de stats aggregated
      const previousBest = await this.prisma.setPerformance.findFirst({
        where: {
          exerciceSession: {
            exerciceId: exercise.exerciceId,
            trainingSession: {
              trainingProgram: { fitnessProfile: { userId } },
              completed: true,
              id: { not: session.id }, // Exclure la session actuelle
            },
          },
          success: true,
        },
        orderBy: { weight: 'desc' },
        select: { weight: true },
      });

      const previousMax = previousBest?.weight || 0;

      // Si on a battu le record (et qu'il y avait un record ou au moins que c'est significatif)
      // On considère un PR si on bat l'ancien. Si c'est la toute première fois, c'est aussi un PR techniquement.
      // Dison qu'on notifie toujours si > previousMax.
      if (maxWeightSession > previousMax) {
        await this.activityService.createActivity(
          userId,
          ActivityType.PERSONAL_RECORD,
          {
            exerciseName: exercise.exercice.name,
            value: `${maxWeightSession}kg`,
            previousValue: previousMax > 0 ? `${previousMax}kg` : null,
            sessionId: session.id,
            exerciseId: exercise.exerciceId,
          }
        );
      }
    }
  }

  /**
   * 📊Créer un résumé de session pour optimiser l'affichage calendrier
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

      // 🔥 Variables pour le calcul de calories
      let standardExerciseTime = 0; // Minutes d'exercices standard
      let cardioExerciseTime = 0;   // Minutes de cardio

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

        // 🔥 Comptabiliser le temps par type d'exercice
        // Estimation: 3 minutes par exercice (incluant repos entre séries)
        const estimatedExerciseTime = 3;

        if (ex.exercice?.type === 'CARDIO') {
          cardioExerciseTime += estimatedExerciseTime;
        } else {
          standardExerciseTime += estimatedExerciseTime;
        }
      });

      // Calculer la moyenne RPE
      const avgRPE = rpeCount > 0 ? totalRPE / rpeCount : null;

      // 🔥 CALCUL DES CALORIES BRÛLÉES
      // Récupérer le poids de l'utilisateur
      const user = await prisma.user.findUnique({
        where: { id: session.trainingProgram.fitnessProfile.userId },
        include: {
          fitnessProfiles: {
            where: { id: session.trainingProgram.fitnessProfileId },
            select: { weight: true },
          },
        },
      });

      const userWeight = user?.fitnessProfiles?.[0]?.weight || 70; // Défaut 70kg

      // Valeurs MET (Metabolic Equivalent of Task)
      // Source: Compendium of Physical Activities
      const MET_STRENGTH_TRAINING = 4.5; // Musculation générale
      const MET_CARDIO = 8.0;             // Cardio modéré-intense

      // Durée réelle de la session (si disponible)
      const sessionDuration = session.duration || (standardExerciseTime + cardioExerciseTime);

      // Si on a des infos détaillées sur les types d'exercices
      let caloriesBurned = 0;

      if (cardioExerciseTime > 0 || standardExerciseTime > 0) {
        // Calcul séparé par type
        // Formule: MET × poids (kg) × durée (heures)
        const standardCalories = MET_STRENGTH_TRAINING * userWeight * (standardExerciseTime / 60);
        const cardioCalories = MET_CARDIO * userWeight * (cardioExerciseTime / 60);
        caloriesBurned = Math.round(standardCalories + cardioCalories);
      } else {
        // Pas d'info détaillée, utiliser la durée globale avec MET moyen
        caloriesBurned = Math.round(MET_STRENGTH_TRAINING * userWeight * (sessionDuration / 60));
      }

      // Créer ou mettre à jour le résumé
      await prisma.sessionSummary.upsert({
        where: { sessionId: session.id },
        create: {
          sessionId: session.id,
          totalSets,
          totalReps,
          totalVolume,
          avgRPE,
          caloriesBurned,
          duration: session.duration,
          muscleGroups: Array.from(muscleGroupsSet),
        },
        update: {
          totalSets,
          totalReps,
          totalVolume,
          avgRPE,
          caloriesBurned,
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

  /**
   * Annuler une TrainingSession (soft delete avec status CANCELLED)
   * ✅ Problème 2 résolu : La session n'est plus supprimée mais marquée comme annulée
   * Permet de la relancer plus tard via startFromTemplate()
   */
  async deleteSession(sessionId: number, userId: number) {
    return this.prisma.$transaction(async (prisma) => {
      // Vérifier que la session existe et appartient à l'utilisateur
      const session = await prisma.trainingSession.findUnique({
        where: { id: sessionId },
        include: {
          trainingProgram: {
            include: { fitnessProfile: true },
          },
        },
      });

      if (!session) {
        throw new NotFoundException('Session introuvable');
      }

      this.programService.verifyPermissions(
        session.trainingProgram.fitnessProfile.userId,
        userId,
        'cette session'
      );

      // 🆕 SOFT DELETE : Au lieu de supprimer, on marque comme CANCELLED
      // Supprimer les performances
      await prisma.setPerformance.deleteMany({
        where: {
          exerciceSession: {
            sessionId,
          },
        },
      });

      // Supprimer les exercices de la session
      await prisma.exerciceSession.deleteMany({
        where: { sessionId },
      });

      // Supprimer le résumé de session s'il existe
      await prisma.sessionSummary.deleteMany({
        where: { sessionId },
      });

      // ✅ Marquer la session comme CANCELLED au lieu de la supprimer
      await prisma.trainingSession.update({
        where: { id: sessionId },
        data: {
          status: 'CANCELLED',
          completed: false, // Reset
          performedAt: null, // Reset
        },
      });

      return { message: 'Session annulée avec succès. Vous pouvez la relancer plus tard.' };
    });
  }

  /**
   * 📊 OPTIMISÉ: Récupère les statistiques utilisateur (calcul côté DB)
   */
  async getUserStats(userId: number) {
    // Utiliser des requêtes SQL optimisées avec comptage côté DB
    const [totalSessions, completedSessions, upcomingSessions] = await Promise.all([
      // Total de sessions (programmes actifs uniquement)
      this.prisma.trainingSession.count({
        where: {
          trainingProgram: {
            fitnessProfile: { userId },
            status: 'ACTIVE',
          },
        },
      }),
      // Sessions complétées
      this.prisma.trainingSession.count({
        where: {
          trainingProgram: {
            fitnessProfile: { userId },
            status: 'ACTIVE',
          },
          completed: true,
        },
      }),
      // Sessions à venir (planifiées et non complétées)
      this.prisma.trainingSession.count({
        where: {
          trainingProgram: {
            fitnessProfile: { userId },
            status: 'ACTIVE',
          },
          completed: false,
          date: {
            not: null,
          },
        },
      }),
    ]);

    return {
      totalSessions,
      completedSessions,
      upcomingSessions,
    };
  }

  /**
   * 🏆 OPTIMISÉ: Récupère les top 3 records personnels (calcul côté DB)
   * Utilise une requête SQL optimisée pour calculer le meilleur volume par exercice
   */
  async getPersonalRecords(userId: number, limit = 3) {
    // Récupérer toutes les exercicesSessions avec leurs performances
    const exerciseSessions = await this.prisma.exerciceSession.findMany({
      where: {
        trainingSession: {
          trainingProgram: {
            fitnessProfile: { userId },
            status: 'ACTIVE',
          },
          completed: true,
        },
      },
      select: {
        exerciceId: true,
        exercice: {
          select: {
            id: true,
            name: true,
          },
        },
        trainingSession: {
          select: {
            performedAt: true,
            createdAt: true,
          },
        },
        performances: {
          where: {
            weight: { gt: 0 },
            reps_effectuees: { gt: 0 },
          },
          select: {
            weight: true,
            reps_effectuees: true,
          },
        },
      },
    });

    // Calculer le meilleur volume par exercice côté backend
    const exerciseRecords = new Map<number, {
      exerciseId: number;
      exerciseName: string;
      weight: number;
      reps: number;
      date: Date;
      volume: number;
    }>();

    exerciseSessions.forEach((exSession) => {
      const exerciseId = exSession.exerciceId;
      const exerciseName = exSession.exercice.name;
      const sessionDate = exSession.trainingSession.performedAt || exSession.trainingSession.createdAt;

      // Parcourir toutes les performances de cet exercice
      exSession.performances.forEach((perf) => {
        const weight = perf.weight || 0;
        const reps = perf.reps_effectuees || 0;
        const volume = weight * reps;

        if (volume > 0) {
          const existing = exerciseRecords.get(exerciseId);
          if (!existing || volume > existing.volume) {
            exerciseRecords.set(exerciseId, {
              exerciseId,
              exerciseName,
              weight,
              reps,
              date: sessionDate,
              volume,
            });
          }
        }
      });
    });

    // Retourner les top N records triés par volume
    return Array.from(exerciseRecords.values())
      .sort((a, b) => b.volume - a.volume)
      .slice(0, limit);
  }

  /**
   * 🔥 OPTIMISÉ: Calcule les données de streak (série de jours consécutifs)
   * Récupère uniquement les dates de sessions complétées pour calcul côté backend
   */
  async getUserStreak(userId: number) {
    // Récupérer uniquement les dates de sessions complétées (optimisé)
    const completedSessions = await this.prisma.trainingSession.findMany({
      where: {
        trainingProgram: {
          fitnessProfile: { userId },
          status: 'ACTIVE',
        },
        completed: true,
        performedAt: { not: null },
      },
      select: {
        performedAt: true,
      },
      orderBy: {
        performedAt: 'desc',
      },
    });

    if (completedSessions.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        weekActivity: Array(7).fill(false),
        totalCompletedSessions: 0,
      };
    }

    // Convertir en dates uniques (un jour = une session max pour le streak)
    const uniqueDates = new Set<string>();
    completedSessions.forEach((session) => {
      // performedAt ne peut pas être null car on filtre dans la query
      const date = new Date(session.performedAt!);
      date.setHours(0, 0, 0, 0);
      uniqueDates.add(date.toISOString());
    });

    const sortedDates = Array.from(uniqueDates)
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    // Calculer la série actuelle
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedDates.length; i++) {
      const sessionDate = new Date(sortedDates[i]);
      sessionDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - currentStreak);

      const diffDays = Math.floor((expectedDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        currentStreak++;
      } else if (diffDays > 1) {
        break;
      }
    }

    // Calculer la plus longue série
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
        longestStreak = 1;
      } else {
        const diff = Math.floor((sortedDates[i - 1].getTime() - sortedDates[i].getTime()) / (1000 * 60 * 60 * 24));
        if (diff <= 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
    }

    // Calculer l'activité des 7 derniers jours
    const weekActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);

      return sortedDates.some(sessionDate => {
        const sd = new Date(sessionDate);
        sd.setHours(0, 0, 0, 0);
        return sd.getTime() === date.getTime();
      });
    });

    return {
      currentStreak,
      longestStreak,
      weekActivity,
      totalCompletedSessions: completedSessions.length,
    };
  }

  /**
   * 🔧 Modifier le nombre de séries d'un exercice pendant une session active
   */
  async updateExerciceSessionSets(
    exerciceSessionId: number,
    newSets: number,
    userId: number
  ) {
    // Valider que newSets est positif
    if (newSets < 1) {
      throw new BadRequestException('Le nombre de séries doit être au moins 1');
    }

    if (newSets > 20) {
      throw new BadRequestException('Le nombre de séries ne peut pas dépasser 20');
    }

    // 🚀 OPTIMISÉ: Requête légère pour récupérer uniquement le userId et le status de session
    const exerciceSession = await this.prisma.exerciceSession.findUnique({
      where: { id: exerciceSessionId },
      select: {
        id: true,
        trainingSession: {
          select: {
            completed: true,
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
        },
      },
    });

    if (!exerciceSession) {
      throw new NotFoundException('Exercice de session non trouvé');
    }

    // Vérifier que l'utilisateur a le droit de modifier cette session
    const ownerId = exerciceSession.trainingSession.trainingProgram.fitnessProfile.userId;
    if (ownerId !== userId) {
      throw new BadRequestException('Vous n\'avez pas la permission de modifier cette session');
    }

    // Vérifier que la session n'est pas déjà complétée
    if (exerciceSession.trainingSession.completed) {
      throw new BadRequestException('Impossible de modifier une session déjà terminée');
    }

    // 🚀 OPTIMISÉ: Update simple sans include inutile
    // Le frontend n'utilise pas la réponse, il met à jour son state local
    await this.prisma.exerciceSession.update({
      where: { id: exerciceSessionId },
      data: { sets: newSets },
    });

    return { id: exerciceSessionId, sets: newSets };
  }

}
