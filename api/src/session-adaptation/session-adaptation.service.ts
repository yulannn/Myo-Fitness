import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { SessionSchedulingHelper } from 'src/program/session-scheduling.helper';

enum PerformanceStatus {
    TOO_EASY = 'too_easy',
    TOO_HARD = 'too_hard',
    PERFECT = 'perfect',
}

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
                            select: { userId: true },
                        },
                    },
                },
                exercices: {
                    include: {
                        performances: true,
                        exercice: true,
                    },
                },
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


    // Fonction  lorsque l'utilisateur veut une adaptation automatique basée sur les performances précédentes

    async createAdaptedSessionFromPrevious(trainingSessionId: number, userId: number) {
        const session = await this.getSessionWithPerformances(trainingSessionId, userId);

        const hasPerformances = session.exercices.every(
            ex => ex.performances && ex.performances.length > 0,
        );

        if (!hasPerformances) {
            throw new NotFoundException(
                'Cannot adapt session: no performances data found. Please complete the session first.',
            );
        }

        return this.createAdaptedSession(session);
    }



    private analyzePerformance(performances: any[]) {
        const totalSets = performances.length;

        const failedSets = performances.filter((p) => p.success === false).length;

        const avgRPE =
            performances.reduce((sum, p) => sum + (p.rpe ?? 0), 0) / totalSets;


        if (failedSets === 0 && avgRPE < 8) {
            return PerformanceStatus.TOO_EASY;
        }
        if (failedSets >= 3 || avgRPE > 9) {
            return PerformanceStatus.TOO_HARD;
        }
        return PerformanceStatus.PERFECT;
    }


    private adaptExercise(exerciceSession: any, status: PerformanceStatus) {
        let reps = exerciceSession.reps;
        let weight = exerciceSession.weight;
        const isBodyweight = exerciceSession.exercice.bodyWeight;

        switch (status) {
            case PerformanceStatus.TOO_EASY:
                if (isBodyweight) {
                    reps += 2;
                } else if (weight) {
                    weight = Math.round(weight * 1.05 * 2) / 2;
                }
                break;

            case PerformanceStatus.TOO_HARD:
                if (isBodyweight) {
                    reps = Math.max(5, reps - 2);
                } else if (weight) {
                    weight = Math.round(weight * 0.9 * 2) / 2;
                }
                break;

            case PerformanceStatus.PERFECT:
            default:

                break;
        }

        return { reps, weight };
    }


    private async createAdaptedSession(previousSession) {

        const originalSessionId = previousSession.originalSessionId || previousSession.id;

        // Récupérer le profil fitness pour obtenir les trainingDays
        const program = await this.prisma.trainingProgram.findUnique({
            where: { id: previousSession.programId },
            include: {
                fitnessProfile: {
                    select: { trainingDays: true },
                },
            },
        });

        const trainingDays = program?.fitnessProfile?.trainingDays || [];

        // Récupérer la dernière session planifiée pour ce programme
        const lastScheduledSession = await this.prisma.trainingSession.findFirst({
            where: {
                programId: previousSession.programId,
                date: { not: null }
            },
            orderBy: { date: 'desc' },
        });

        // La date de référence est la plus récente entre "maintenant" et la dernière session planifiée
        // Cela garantit que la nouvelle session est planifiée APRÈS les sessions existantes
        // et jamais dans le passé
        let referenceDate = new Date();

        if (lastScheduledSession?.date) {
            const lastDate = new Date(lastScheduledSession.date);
            if (lastDate > referenceDate) {
                referenceDate = lastDate;
            }
        }

        // Calculer la prochaine date de session
        const nextSessionDate = SessionSchedulingHelper.getNextSessionDate(
            referenceDate,
            trainingDays,
        );

        const newSession = await this.prisma.trainingSession.create({
            data: {
                programId: previousSession.programId,
                date: nextSessionDate, // null si trainingDays est vide
                duration: null,
                sessionName: `Session adaptée basée sur la session du ${previousSession.date
                    ? new Date(previousSession.date).toLocaleDateString()
                    : 'précédente'
                    }`,
                originalSessionId: originalSessionId,
            },
        });


        for (const exerciceSession of previousSession.exercices) {
            const status = this.analyzePerformance(exerciceSession.performances);
            const adapted = this.adaptExercise(exerciceSession, status);

            await this.prisma.exerciceSession.create({
                data: {
                    sessionId: newSession.id,
                    exerciceId: exerciceSession.exerciceId,
                    sets: exerciceSession.sets,
                    reps: adapted.reps,
                    weight: adapted.weight,
                },
            });
        }

        return this.prisma.trainingSession.findUnique({
            where: { id: newSession.id },
            include: {
                exercices: {
                    include: { exercice: true },
                },
            },
        });
    }



    // Fonction lorsque l'utilisateur ne veut pas d'adaptation automatique ou n'a pas de données de performance

    async createNewSimilarSession(trainingSessionId: number, userId: number) {


        const oldSession = await this.getSessionWithPerformances(trainingSessionId, userId);


        const originalSessionId = oldSession.originalSessionId || oldSession.id;

        // Récupérer le profil fitness pour obtenir les trainingDays
        const program = await this.prisma.trainingProgram.findUnique({
            where: { id: oldSession.programId },
            include: {
                fitnessProfile: {
                    select: { trainingDays: true },
                },
            },
        });

        const trainingDays = program?.fitnessProfile?.trainingDays || [];

        // Récupérer la dernière session planifiée pour ce programme
        const lastScheduledSession = await this.prisma.trainingSession.findFirst({
            where: {
                programId: oldSession.programId,
                date: { not: null }
            },
            orderBy: { date: 'desc' },
        });

        // La date de référence est la plus récente entre "maintenant" et la dernière session planifiée
        let referenceDate = new Date();

        if (lastScheduledSession?.date) {
            const lastDate = new Date(lastScheduledSession.date);
            if (lastDate > referenceDate) {
                referenceDate = lastDate;
            }
        }

        // Calculer la prochaine date de session
        const nextSessionDate = SessionSchedulingHelper.getNextSessionDate(
            referenceDate,
            trainingDays,
        );

        const newSession = await this.prisma.trainingSession.create({
            data: {
                programId: oldSession.programId,
                date: nextSessionDate, // null si trainingDays est vide
                duration: null,
                sessionName: `Session adaptée basée sur la session du ${oldSession.date
                    ? new Date(oldSession.date).toLocaleDateString()
                    : 'précédente'
                    }`,
                originalSessionId: originalSessionId,
            }
        })

        if (!newSession) {
            throw new NotFoundException('Failed to create a new training session.');
        }

        for (const exerciceSession of oldSession.exercices) {

            await this.prisma.exerciceSession.create({
                data: {
                    sessionId: newSession.id,
                    exerciceId: exerciceSession.exerciceId,
                    sets: exerciceSession.sets,
                    reps: exerciceSession.reps,
                    weight: exerciceSession.weight,
                }
            })
        }

        return this.prisma.trainingSession.findUnique({
            where: { id: newSession.id },
            include: {
                exercices: {
                    include: { exercice: true },
                },
            },
        });
    }
}
