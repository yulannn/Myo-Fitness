import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateSessionAdaptationDto } from './dto/create-session-adaptation.dto';
import { UpdateSessionAdaptationDto } from './dto/update-session-adaptation.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SessionAdaptationService {
  constructor(private prisma: PrismaService) { }


  async getSessionWithPerformances(trainingSessionId: number, userId: number) {
    const session = await this.prisma.trainingSession.findUnique({
      where: { id: trainingSessionId },
      include: {
        trainingProgram: {
          include: {
            fitnessProfile: {
              select: {
                userId: true,
              }
            }
          }
        },
        exercices: {
          include: {
            performances: true,
            exercice: true,
          }
        }
      },
    });

    if (!session) {
      throw new NotFoundException(`Training session #${trainingSessionId} not found`);
    }

    if (session.trainingProgram.fitnessProfile.userId !== userId) {
      throw new ForbiddenException('You do not have access to this training session');
    }

    return session;
  }


  async createAdaptedSessionFromPrevious(trainingSessionId: number, userId: number) {
    const session = await this.prisma.trainingSession.findUnique({
      where: { id: trainingSessionId },
      include: {
        trainingProgram: {
          include: {
            fitnessProfile: {
              select: {
                userId: true,
              }
            }
          }
        },
        exercices: {
          include: {
            performances: true,
            exercice: true,
          }
        }
      },
    });

    if (!session) {
      throw new NotFoundException(`Training session #${trainingSessionId} not found`);
    }

    if (session.trainingProgram.fitnessProfile.userId !== userId) {
      throw new ForbiddenException('You do not have access to this training session');
    }

    if (!session.exercices || session.exercices.length === 0) {
      throw new NotFoundException('No exercices found for this session');
    }

    const hasPerformances = session.exercices.every(
      exercice => exercice.performances && exercice.performances.length > 0
    );

    if (!hasPerformances) {
      throw new NotFoundException(
        'Cannot adapt session: no performances data found. Please complete the session first.'
      );
    }

    const newSession = await this.createAdaptedSession(session);

    if (!newSession) {
      throw new Error('Failed to create adapted session');
    }

    return newSession;
  }

  /**
   * Crée une nouvelle session adaptée basée sur les performances de la session précédente
   * Règles d'adaptation :
   * - Si l'utilisateur a réussi toutes les séries : augmenter la charge de 5%
   * - Si l'utilisateur a échoué à 1-2 séries : maintenir la charge
   * - Si l'utilisateur a échoué à 3+ séries : réduire la charge de 10%
   * - Pour les exercices au poids du corps : ajuster les reps au lieu du poids
   */

  private async createAdaptedSession(previousSession) {
    const newSession = await this.prisma.trainingSession.create({
      data: {
        programId: previousSession.programId,
        date: null,
        duration: null,
        notes: `Session adaptée basée sur la session du ${previousSession.date ? new Date(previousSession.date).toLocaleDateString() : 'précédente'}`,
        originalSessionId: previousSession.id,
      },
    });

    for (const exerciceSession of previousSession.exercices) {

      const performances = exerciceSession.performances;
      const totalSets = performances.length;
      const failedSets = performances.filter(p => p.success === false).length;
      const avgRPE = performances.reduce((sum, p) => sum + (p.rpe || 0), 0) / totalSets;

      let newWeight = exerciceSession.weight;
      let newReps = exerciceSession.reps;


      if (failedSets === 0 && avgRPE < 8) {

        if (exerciceSession.exercice.bodyWeight) {

          newReps = exerciceSession.reps + 2;
        } else {
          newWeight = exerciceSession.weight ? Math.round(exerciceSession.weight * 1.05 * 2) / 2 : null; // Arrondi à 0.5kg
        }
      } else if (failedSets >= 3 || avgRPE > 9) {

        if (exerciceSession.exercice.bodyWeight) {

          newReps = Math.max(5, exerciceSession.reps - 2);
        } else {

          newWeight = exerciceSession.weight ? Math.round(exerciceSession.weight * 0.90 * 2) / 2 : null; // Arrondi à 0.5kg
        }
      } else if (failedSets >= 1 && failedSets <= 2) {
        newWeight = exerciceSession.weight;
        newReps = exerciceSession.reps;
      }

      await this.prisma.exerciceSession.create({
        data: {
          sessionId: newSession.id,
          exerciceId: exerciceSession.exerciceId,
          sets: exerciceSession.sets,
          reps: newReps,
          weight: newWeight,
        },
      });
    }

    return await this.prisma.trainingSession.findUnique({
      where: { id: newSession.id },
      include: {
        exercices: {
          include: {
            exercice: true,
          }
        }
      },
    });
  }
}
