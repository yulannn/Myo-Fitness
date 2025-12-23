import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { SessionSchedulingHelper } from 'src/program/session-scheduling.helper';
import { PerformanceAnalyzer } from './adapters/performance-analyzer';
import { AdaptationStrategyEngine } from './adapters/adaptation-strategy';
import { ExerciseAdapter } from './adapters/exercise-adapter';

/**
 * Service d'adaptation professionnel de séances
 * Architecture modulaire avec analyseur, stratégie et adaptateur séparés
 */
@Injectable()
export class SessionAdaptationService {
    private readonly performanceAnalyzer: PerformanceAnalyzer;
    private readonly strategyEngine: AdaptationStrategyEngine;
    private readonly exerciseAdapter: ExerciseAdapter;

    constructor(private prisma: PrismaService) {
        this.performanceAnalyzer = new PerformanceAnalyzer();
        this.strategyEngine = new AdaptationStrategyEngine();
        this.exerciseAdapter = new ExerciseAdapter();
    }

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

    /**
     * Crée une session adaptée basée sur les performances
     */
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

    /**
     * Crée une nouvelle session similaire sans adaptation
     */
    async createNewSimilarSession(trainingSessionId: number, userId: number) {
        const oldSession = await this.getSessionWithPerformances(trainingSessionId, userId);

        // 🆕 Si la session vient d'un template, créer une nouvelle instance depuis ce template
        if (oldSession.sessionTemplateId) {
            return this.createInstanceFromTemplate(oldSession);
        }

        // Sinon, cloner la session (legacy)
        return this.cloneLegacySession(oldSession);
    }

    /**
     * 🆕 Crée une instance depuis un template (sans le modifier)
     */
    private async createInstanceFromTemplate(oldSession: any) {
        const templateId = oldSession.sessionTemplateId;

        return this.prisma.$transaction(async (tx) => {
            // Récupérer le template
            const template = await tx.sessionTemplate.findUnique({
                where: { id: templateId },
                include: {
                    exercises: {
                        include: { exercise: true },
                        orderBy: { orderInSession: 'asc' },
                    },
                    trainingProgram: {
                        include: {
                            fitnessProfile: { select: { trainingDays: true } },
                        },
                    },
                },
            });

            if (!template) {
                throw new NotFoundException('Template not found');
            }

            // Calculer la prochaine date
            const trainingDays = template.trainingProgram.fitnessProfile.trainingDays || [];
            const nextSessionDate = this.calculateNextSessionDate(
                oldSession.programId,
                trainingDays
            );

            // Créer la nouvelle instance
            const newSession = await tx.trainingSession.create({
                data: {
                    programId: oldSession.programId,
                    sessionTemplateId: templateId,
                    date: nextSessionDate,
                    sessionName: template.name,
                },
            });

            // Copier les exercices du template (valeurs actuelles, non modifiées)
            for (const exTemplate of template.exercises) {
                await tx.exerciceSession.create({
                    data: {
                        sessionId: newSession.id,
                        exerciceId: exTemplate.exerciseId,
                        sets: exTemplate.sets,
                        reps: exTemplate.reps,
                        weight: exTemplate.weight,
                    },
                });
            }

            return tx.trainingSession.findUnique({
                where: { id: newSession.id },
                include: {
                    exercices: {
                        include: { exercice: true },
                    },
                },
            });
        });
    }

    /**
     * 🔧 Legacy : Clone une session sans template
     */
    private async cloneLegacySession(oldSession: any) {
        const originalSessionId = oldSession.originalSessionId || oldSession.id;

        const program = await this.prisma.trainingProgram.findUnique({
            where: { id: oldSession.programId },
            include: {
                fitnessProfile: {
                    select: { trainingDays: true },
                },
            },
        });

        const trainingDays = program?.fitnessProfile?.trainingDays || [];
        const nextSessionDate = this.calculateNextSessionDate(oldSession.programId, trainingDays);

        const newSession = await this.prisma.trainingSession.create({
            data: {
                programId: oldSession.programId,
                date: nextSessionDate,
                duration: null,
                sessionName: `Session basée sur ${oldSession.sessionName || 'session précédente'}`,
                originalSessionId: originalSessionId,
            }
        });

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

    /**
     * Logique principale d'adaptation avec le nouveau système template
     */
    private async createAdaptedSession(previousSession: any) {
        // 🆕 NOUVEAU COMPORTEMENT : Adapter le TEMPLATE, pas créer une nouvelle session

        // Si la session vient d'un template, on adapte le template
        if (previousSession.sessionTemplateId) {
            return this.adaptTemplateAndCreateInstance(previousSession);
        }

        // Sinon, session manuelle (legacy) - on crée une nouvelle session comme avant
        return this.createLegacyAdaptedSession(previousSession);
    }

    /**
     * 🆕 Adapte UNIQUEMENT le template source (sans créer d'instance)
     */
    private async adaptTemplateAndCreateInstance(previousSession: any) {
        const templateId = previousSession.sessionTemplateId;

        return this.prisma.$transaction(async (tx) => {
            // Récupérer le template actuel
            const template = await tx.sessionTemplate.findUnique({
                where: { id: templateId },
                include: {
                    exercises: {
                        include: { exercise: true },
                        orderBy: { orderInSession: 'asc' },
                    },
                },
            });

            if (!template) {
                throw new NotFoundException('Template not found');
            }

            // Pour chaque exercice du template, l'adapter selon les performances
            for (const exTemplate of template.exercises) {
                // Trouver l'exercice correspondant dans la session complétée
                const performedEx = previousSession.exercices.find(
                    (ex: any) => ex.exerciceId === exTemplate.exerciseId
                );

                if (!performedEx?.performances || performedEx.performances.length === 0) {
                    continue; // Pas de performances, on garde le template tel quel
                }

                // Calculer le poids moyen depuis les performances RÉELLES
                const performancesWithWeight = performedEx.performances.filter((p: any) => p.weight != null);
                const avgWeight = performancesWithWeight.length > 0
                    ? performancesWithWeight.reduce((sum: number, p: any) => sum + (p.weight || 0), 0) / performancesWithWeight.length
                    : (performedEx.weight || 0);

                // 1. Analyser les performances
                const analysis = this.performanceAnalyzer.analyze(
                    performedEx.performances,
                    performedEx.reps,
                    avgWeight, // ✅ Utiliser le poids réel des performances
                    performedEx.sets
                );

                // 2. Déterminer la stratégie
                const strategy = this.strategyEngine.determine(
                    analysis.recommendation,
                    exTemplate.exercise.bodyWeight,
                    avgWeight // ✅ Utiliser le poids réel des performances
                );

                // 3. Appliquer l'adaptation
                const adapted = this.exerciseAdapter.adapt(
                    performedEx.reps,
                    avgWeight, // ✅ Utiliser le poids réel des performances
                    performedEx.sets,
                    strategy,
                    exTemplate.exercise.bodyWeight
                );

                // 4. ✅ METTRE À JOUR LE TEMPLATE (seule action, pas de création d'instance)
                await tx.exerciseTemplate.update({
                    where: { id: exTemplate.id },
                    data: {
                        sets: adapted.sets,
                        reps: adapted.reps,
                        weight: adapted.weight,
                    },
                });
            }

            // ✅ Retourner le template mis à jour (pas de nouvelle instance créée)
            return tx.sessionTemplate.findUnique({
                where: { id: templateId },
                include: {
                    exercises: {
                        include: { exercise: true },
                        orderBy: { orderInSession: 'asc' },
                    },
                },
            });
        });
    }

    /**
     * 🔧 Legacy : Crée une session adaptée sans template (ancien comportement)
     */
    private async createLegacyAdaptedSession(previousSession: any) {
        const originalSessionId = previousSession.originalSessionId || previousSession.id;

        // Calculer la prochaine date
        const program = await this.prisma.trainingProgram.findUnique({
            where: { id: previousSession.programId },
            include: {
                fitnessProfile: { select: { trainingDays: true } },
            },
        });

        const trainingDays = program?.fitnessProfile?.trainingDays || [];
        const nextSessionDate = this.calculateNextSessionDate(previousSession.programId, trainingDays);

        // Créer la nouvelle session
        const newSession = await this.prisma.trainingSession.create({
            data: {
                programId: previousSession.programId,
                date: nextSessionDate,
                duration: null,
                sessionName: `Session adaptée - ${new Date().toLocaleDateString()}`,
                originalSessionId: originalSessionId,
            },
        });

        // Adapter chaque exercice
        for (const exerciceSession of previousSession.exercices) {

            // 1. Analyser les performances
            const analysis = this.performanceAnalyzer.analyze(
                exerciceSession.performances,
                exerciceSession.reps,
                exerciceSession.weight,
                exerciceSession.sets
            );

            // 2. Déterminer la stratégie
            const strategy = this.strategyEngine.determine(
                analysis.recommendation,
                exerciceSession.exercice.bodyWeight,
                exerciceSession.weight
            );

            // 3. Appliquer l'adaptation
            const adapted = this.exerciseAdapter.adapt(
                exerciceSession.reps,
                exerciceSession.weight,
                exerciceSession.sets,
                strategy,
                exerciceSession.exercice.bodyWeight
            );

            // 4. Créer l'exercice adapté
            await this.prisma.exerciceSession.create({
                data: {
                    sessionId: newSession.id,
                    exerciceId: exerciceSession.exerciceId,
                    sets: adapted.sets,
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

    /**
     * Calcule la prochaine date de session
     */
    private calculateNextSessionDate(programId: number, trainingDays: any[]): Date | null {
        return SessionSchedulingHelper.getNextSessionDate(
            new Date(),
            trainingDays as any,
        );
    }
}
