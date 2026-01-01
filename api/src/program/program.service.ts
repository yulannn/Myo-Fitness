import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateTrainingProgramDto } from './dto/create-program.dto';
import { PrismaService } from 'prisma/prisma.service';
import { IaService } from 'src/ia/ia.service';
import type { ProgramTemplate } from '@prisma/client';
import { CreateManualProgramDto } from './dto/create-manual-program.dto';
import { AddSessionToProgramDto } from './dto/add-session-program.dto';
import { SessionSchedulingHelper } from './session-scheduling.helper';
const MAX_SESSIONS_PER_PROGRAM = 7;

@Injectable()
export class ProgramService {
    constructor(private prisma: PrismaService, private iaService: IaService) { }

    // ✅ Récupère UNIQUEMENT le programme ACTIF (plus rapide)
    async getActiveProgram(userId: number) {
        return this.prisma.trainingProgram.findFirst({
            where: {
                fitnessProfile: { userId },
                status: 'ACTIVE'
            },
            select: {
                id: true,
                name: true,

                status: true,
                createdAt: true,
                template: true,
                startDate: true,

                // 🆕 Templates de séances
                sessionTemplates: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        orderInProgram: true,
                        exercises: {
                            select: {
                                id: true,
                                sets: true,
                                reps: true,
                                weight: true,
                                duration: true, // 🆕 Pour cardio
                                orderInSession: true,
                                exercise: {
                                    select: {
                                        id: true,
                                        name: true,
                                        imageUrl: true,
                                        bodyWeight: true,
                                        type: true, // 🆕 Pour identifier cardio
                                    }
                                }
                            },
                            orderBy: { orderInSession: 'asc' }
                        },
                        _count: {
                            select: {
                                instances: true // Nombre d'instances créées
                            }
                        }
                    },
                    orderBy: { orderInProgram: 'asc' }
                },

                // Sessions non complétées uniquement
                sessions: {
                    where: { completed: false },
                    select: {
                        id: true,
                        sessionName: true,
                        date: true,
                        completed: true,
                        performedAt: true,
                        sessionTemplateId: true, // 🆕 Pour savoir de quel template
                        // Exercices avec données minimales
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
                                        imageUrl: true
                                    }
                                }
                            }
                        },
                        _count: {
                            select: {
                                exercices: true
                            }
                        }
                    },
                    orderBy: {
                        date: 'asc'
                    }
                },
                // Compter toutes les sessions (pour stats)
                _count: {
                    select: {
                        sessions: true
                    }
                }
            }
        });
    }

    // ✅ Récupère les programmes ARCHIVÉS (lazy-loaded)
    async getArchivedPrograms(userId: number) {
        return this.prisma.trainingProgram.findMany({
            where: {
                fitnessProfile: { userId },
                status: 'ARCHIVED'
            },
            select: {
                id: true,
                name: true,

                status: true,
                createdAt: true,
                template: true,
                startDate: true,
                // 🆕 Templates de séances (pour afficher le contenu en lecture seule)
                sessionTemplates: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        orderInProgram: true,
                        exercises: {
                            select: {
                                id: true,
                                sets: true,
                                reps: true,
                                weight: true,
                                orderInSession: true,
                                exercise: {
                                    select: {
                                        id: true,
                                        name: true,
                                    }
                                }
                            },
                            orderBy: { orderInSession: 'asc' }
                        },
                    },
                    orderBy: { orderInProgram: 'asc' }
                },
                _count: {
                    select: {
                        sessions: true,
                        sessionTemplates: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    // 🔧 LEGACY: Garde pour compatibilité (peut être supprimée plus tard)
    async getProgramsByUser(userId: number) {
        return this.prisma.trainingProgram.findMany({
            where: { fitnessProfile: { userId } },
            select: {
                id: true,
                name: true,

                status: true,
                createdAt: true,
                template: true,
                startDate: true,
                sessions: {
                    where: { completed: false },
                    select: {
                        id: true,
                        sessionName: true,
                        date: true,
                        completed: true,
                        performedAt: true,
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
                                        imageUrl: true
                                    }
                                }
                            }
                        },
                        _count: {
                            select: {
                                exercices: true
                            }
                        }
                    },
                    orderBy: {
                        date: 'asc'
                    }
                },
                _count: {
                    select: {
                        sessions: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async getProgramById(programId: number, userId: number) {
        const program = await this.prisma.trainingProgram.findUnique({
            where: { id: programId },
            include: { fitnessProfile: true, sessions: { include: { exercices: true } } },
        });

        if (!program) {
            throw new BadRequestException('Programme introuvable');
        }

        this.verifyPermissions(program.fitnessProfile.userId, userId, 'ce programme');

        return program;
    }

    async create(createProgramDto: CreateTrainingProgramDto, userId: number) {

        const fitnessProfile = await this.validateFitnessProfile(createProgramDto.fitnessProfileId, userId);

        // 🎯 Passe le template optionnel choisi par l'utilisateur (sinon auto-calculé)
        const program = await this.iaService.generateProgram(fitnessProfile, createProgramDto.template);

        if (!program) {
            throw new Error('Program generation failed');
        }

        const validatedExercises = await this.validateExercisesExist(program.sessions);

        return this.persistProgram(createProgramDto, program, validatedExercises, userId);
    }

    private async validateFitnessProfile(profileId: number, userId: number) {
        const profile = await this.prisma.fitnessProfile.findFirst({ where: { id: profileId, userId } });
        if (!profile) throw new ForbiddenException('Profil fitness introuvable ou non autorisé');
        return profile;
    }

    private async validateExercisesExist(sessions: any[]): Promise<number[]> {

        const allExerciseIds = new Set<number>();
        for (const s of sessions) for (const ex of s.exercises) allExerciseIds.add(typeof ex === 'number' ? ex : ex.id);

        const found = await this.prisma.exercice.findMany({ where: { id: { in: [...allExerciseIds] } }, select: { id: true } });
        const foundIds = new Set(found.map((e) => e.id));
        const missing = [...allExerciseIds].filter((id) => !foundIds.has(id));

        if (missing.length) {
            throw new BadRequestException(`Exercices manquants: ${missing.join(', ')}`);
        }

        return [...foundIds] as number[];
    }

    public verifyPermissions(entityUserId: number, userId: number, context: string) {
        if (entityUserId !== userId) {
            throw new ForbiddenException(`Accès refusé à ${context}`);
        }
    }


    private async persistProgram(dto: CreateTrainingProgramDto, program: any, exerciseIds: number[], userId: number) {
        return this.prisma.$transaction(async (prisma) => {
            await prisma.trainingProgram.updateMany({
                where: { fitnessProfileId: dto.fitnessProfileId },
                data: { status: 'ARCHIVED' },
            });

            // Récupérer le profil fitness pour obtenir les trainingDays
            const fitnessProfile = await prisma.fitnessProfile.findUnique({
                where: { id: dto.fitnessProfileId },
                select: { trainingDays: true },
            });

            const trainingDays = fitnessProfile?.trainingDays || [];

            // Déterminer la startDate pour la planification
            const startDate = SessionSchedulingHelper.determineStartDate(
                dto.startDate,
                trainingDays,
            );

            // Générer les dates pour toutes les sessions
            const sessionDates = SessionSchedulingHelper.generateSessionDates(
                startDate,
                trainingDays,
                program.sessions.length,
            );

            const createdProgram = await prisma.trainingProgram.create({
                data: {
                    name: dto.name,

                    fitnessProfileId: dto.fitnessProfileId,
                    template: program.template as ProgramTemplate,
                    status: 'ACTIVE',
                    startDate: startDate || new Date(),
                },
            });

            // 🆕 LAZY LOADING : Créer SessionTemplates + TrainingSessions SANS ExerciceSessions
            // Les ExerciceSessions seront créées dynamiquement au startFromTemplate()
            // Cela garantit la synchronisation avec le template (Problème 1 résolu ✅)
            for (let i = 0; i < program.sessions.length; i++) {
                const session = program.sessions[i];

                // 1️⃣ Créer le template
                const sessionTemplate = await prisma.sessionTemplate.create({
                    data: {
                        programId: createdProgram.id,
                        name: session.name,
                        orderInProgram: i,
                    },
                });

                // 2️⃣ Créer les ExerciseTemplates
                for (let j = 0; j < session.exercises.length; j++) {
                    const ex = session.exercises[j];
                    await prisma.exerciseTemplate.create({
                        data: {
                            sessionTemplateId: sessionTemplate.id,
                            exerciseId: typeof ex === 'number' ? ex : ex.id,
                            sets: typeof ex === 'object' ? (ex.sets ?? 3) : 3,
                            reps: typeof ex === 'object' ? (ex.reps ?? 8) : 8,
                            weight: typeof ex === 'object' ? ex.weight : null,
                            orderInSession: j,
                        },
                    });
                }

                // 3️⃣ Créer la TrainingSession (avec date si trainingDays définis)
                // ⚠️ IMPORTANT : PAS de création d'ExerciceSession ici (lazy loading)
                const sessionDate = sessionDates[i] || null;
                await prisma.trainingSession.create({
                    data: {
                        programId: createdProgram.id,
                        sessionTemplateId: sessionTemplate.id,
                        sessionName: session.name,
                        date: sessionDate,
                        status: 'SCHEDULED', // 🆕 Nouveau statut
                    },
                });
            }

            return prisma.trainingProgram.findUnique({
                where: { id: createdProgram.id },
                include: {
                    sessions: { include: { exercices: true } },
                    sessionTemplates: {
                        include: {
                            exercises: {
                                include: { exercise: true },
                                orderBy: { orderInSession: 'asc' },
                            },
                        },
                        orderBy: { orderInProgram: 'asc' },
                    },
                },
            });
        });
    }


    async createManualProgram(body: CreateManualProgramDto, userId: number) {
        const { createProgramDto, sessions } = body;

        await this.prisma.trainingProgram.updateMany({
            where: { fitnessProfileId: createProgramDto.fitnessProfileId },
            data: { status: 'ARCHIVED' },
        });

        await this.validateFitnessProfile(createProgramDto.fitnessProfileId, userId);
        return this.prisma.$transaction(async (prisma) => {
            // Récupérer le profil fitness pour obtenir les trainingDays
            const fitnessProfile = await prisma.fitnessProfile.findUnique({
                where: { id: createProgramDto.fitnessProfileId },
                select: { trainingDays: true },
            });

            const trainingDays = fitnessProfile?.trainingDays || [];

            // Déterminer la startDate pour la planification
            const startDate = SessionSchedulingHelper.determineStartDate(
                createProgramDto.startDate,
                trainingDays,
            );

            // Générer les dates pour toutes les sessions
            const sessionDates = SessionSchedulingHelper.generateSessionDates(
                startDate,
                trainingDays,
                sessions.length,
            );

            const createdProgram = await prisma.trainingProgram.create({
                data: {
                    name: createProgramDto.name,

                    fitnessProfileId: createProgramDto.fitnessProfileId,
                    template: 'CUSTOM' as ProgramTemplate,
                    status: 'ACTIVE',
                    startDate: startDate || new Date(),
                },
            });

            // 🆕 LAZY LOADING : Créer templates + TrainingSessions SANS ExerciceSessions
            for (let i = 0; i < sessions.length; i++) {
                const session = sessions[i];

                // 1️⃣ Créer le template
                const sessionTemplate = await prisma.sessionTemplate.create({
                    data: {
                        programId: createdProgram.id,
                        name: session.name ?? `Session ${i + 1}`,
                        orderInProgram: i,
                    },
                });

                // 2️⃣ Créer les ExerciseTemplates
                if (session.exercises && Array.isArray(session.exercises)) {
                    for (let j = 0; j < session.exercises.length; j++) {
                        const ex = session.exercises[j];
                        if (!ex.id) continue;

                        await prisma.exerciseTemplate.create({
                            data: {
                                sessionTemplateId: sessionTemplate.id,
                                exerciseId: ex.id,
                                sets: ex.sets ?? 3,
                                reps: ex.reps ?? 8,
                                weight: ex.weight ?? null,
                                orderInSession: j,
                            },
                        });
                    }
                }

                // 3️⃣ Créer la TrainingSession (date null par défaut)
                // ⚠️ PAS d'ExerciceSession (lazy loading)
                const sessionDate = sessionDates[i] || null;
                await prisma.trainingSession.create({
                    data: {
                        programId: createdProgram.id,
                        sessionTemplateId: sessionTemplate.id,
                        sessionName: session.name ?? `Session ${i + 1}`,
                        date: sessionDate,
                        status: 'SCHEDULED',
                    },
                });
            }

            return prisma.trainingProgram.findUnique({
                where: { id: createdProgram.id },
                include: {
                    sessions: { include: { exercices: true } },
                    sessionTemplates: {
                        include: {
                            exercises: {
                                include: { exercise: true },
                                orderBy: { orderInSession: 'asc' },
                            },
                        },
                        orderBy: { orderInProgram: 'asc' },
                    },
                },
            });
        });
    }

    async addSessionToProgram(body: AddSessionToProgramDto, programId: number, userId: number) {
        const { sessionData } = body;

        const program = await this.prisma.trainingProgram.findUnique({
            where: { id: programId },
            include: { fitnessProfile: true },
        });

        if (!program) {
            throw new BadRequestException('Programme introuvable');
        }

        this.verifyPermissions(program.fitnessProfile.userId, userId, 'ce programme');

        // Compter seulement les sessions actives (non complétées)
        const sessionNumber = await this.prisma.trainingSession.count({
            where: {
                programId,
                completed: false
            }
        });

        if (sessionNumber >= MAX_SESSIONS_PER_PROGRAM)
            throw new BadRequestException(`Le programme a déjà ${MAX_SESSIONS_PER_PROGRAM} sessions actives. Complétez-en une avant d'en ajouter.`);

        return this.prisma.$transaction(async (prisma) => {
            // 1️⃣ Créer d'abord le SessionTemplate
            const sessionTemplate = await prisma.sessionTemplate.create({
                data: {
                    programId: programId,
                    name: sessionData.name ?? 'Session manuelle',
                    orderInProgram: sessionNumber, // Position dans le programme
                },
            });

            // 2️⃣ Créer les ExerciseTemplates
            for (let i = 0; i < sessionData.exercises.length; i++) {
                const ex = sessionData.exercises[i];
                await prisma.exerciseTemplate.create({
                    data: {
                        sessionTemplateId: sessionTemplate.id,
                        exerciseId: ex.id,
                        sets: ex.sets ?? 3,
                        reps: ex.reps ?? 8,
                        weight: ex.weight ?? null,
                        orderInSession: i,
                    },
                });
            }

            // 3️⃣ Créer la TrainingSession vide (lazy loading)
            // ⚠️ PAS d'ExerciceSession - elles seront créées au startFromTemplate()
            await prisma.trainingSession.create({
                data: {
                    programId,
                    sessionTemplateId: sessionTemplate.id,
                    sessionName: sessionData.name ?? 'Session manuelle',
                    date: null, // L'utilisateur planifiera la date manuellement
                    status: 'SCHEDULED',
                },
            });

            return prisma.trainingProgram.findUnique({
                where: { id: programId },
                include: { sessions: { include: { exercices: true } } },
            });
        });
    }

    async deleteSessionFromProgram(sessionId: number, userId: number) {
        const session = await this.prisma.trainingSession.findUnique({
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

        this.verifyPermissions(session.trainingProgram.fitnessProfile.userId, userId, 'cette session');

        return this.prisma.$transaction(async (prisma) => {
            await prisma.exerciceSession.deleteMany({ where: { sessionId } });
            await prisma.trainingSession.delete({ where: { id: sessionId } });

            return prisma.trainingProgram.findUnique({
                where: { id: session.trainingProgram.id },
                include: { sessions: { include: { exercices: true } } },
            });
        });
    }

    async updateProgramStatus(programId: number, status: any, userId: number) {
        const program = await this.prisma.trainingProgram.findUnique({
            where: { id: programId },
            include: { fitnessProfile: true },
        });

        if (!program) {
            throw new BadRequestException('Programme introuvable');
        }

        this.verifyPermissions(program.fitnessProfile.userId, userId, 'ce programme');

        // Si on active un programme, on archive automatiquement tous les autres programmes actifs de l'utilisateur
        if (status === 'ACTIVE') {
            await this.prisma.trainingProgram.updateMany({
                where: {
                    fitnessProfile: { userId: userId },
                    status: 'ACTIVE',
                    id: { not: programId }
                },
                data: { status: 'ARCHIVED' }
            });
        }

        return this.prisma.trainingProgram.update({
            where: { id: programId },
            data: { status },
            include: { sessions: { include: { exercices: true } } },
        });
    }

    async deleteProgram(programId: number, userId: number) {
        const program = await this.prisma.trainingProgram.findUnique({
            where: { id: programId },
            include: { fitnessProfile: true },
        });

        if (!program) {
            throw new BadRequestException('Programme introuvable');
        }

        this.verifyPermissions(program.fitnessProfile.userId, userId, 'ce programme');

        return this.prisma.$transaction(async (prisma) => {
            // Prisma cascade delete should handle relations, but manual cleanup ensures data integrity
            const sessions = await prisma.trainingSession.findMany({ where: { programId } });
            for (const session of sessions) {
                await prisma.exerciceSession.deleteMany({ where: { sessionId: session.id } });
            }
            await prisma.trainingSession.deleteMany({ where: { programId } });

            return prisma.trainingProgram.delete({ where: { id: programId } });
        });
    }

    async updateProgram(programId: number, dto: any, userId: number) {
        const program = await this.prisma.trainingProgram.findUnique({
            where: { id: programId },
            include: { fitnessProfile: true },
        });

        if (!program) {
            throw new BadRequestException('Programme introuvable');
        }

        this.verifyPermissions(program.fitnessProfile.userId, userId, 'ce programme');

        return this.prisma.trainingProgram.update({
            where: { id: programId },
            data: {
                name: dto.name,

            },
            include: { sessions: { include: { exercices: true } } },
        });
    }

    // 🆕 Ajouter un exercice cardio à tous les templates du programme
    async addCardioToProgram(
        programId: number,
        exerciseId: number,
        position: 'START' | 'END',
        duration: number,
        userId: number,
    ) {
        const program = await this.prisma.trainingProgram.findUnique({
            where: { id: programId },
            include: {
                fitnessProfile: true,
                sessionTemplates: {
                    include: { exercises: true },
                },
            },
        });

        if (!program) {
            throw new BadRequestException('Programme introuvable');
        }

        this.verifyPermissions(program.fitnessProfile.userId, userId, 'ce programme');

        // Vérifier que l'exercice existe et est de type CARDIO
        const exercise = await this.prisma.exercice.findUnique({
            where: { id: exerciseId },
            select: { id: true, type: true },
        });

        if (!exercise) {
            throw new BadRequestException('Exercice introuvable');
        }

        if (exercise.type !== 'CARDIO') {
            throw new BadRequestException('L\'exercice sélectionné n\'est pas de type CARDIO');
        }

        return this.prisma.$transaction(async (prisma) => {
            // D'abord, supprimer les exercices cardio existants de tous les templates
            await this.removeCardioFromAllTemplates(prisma, program.sessionTemplates.map(t => t.id));

            // Ajouter l'exercice cardio à chaque template
            for (const template of program.sessionTemplates) {
                const maxOrder = template.exercises.reduce(
                    (max, ex) => Math.max(max, ex.orderInSession),
                    -1
                );

                if (position === 'START') {
                    // Décaler tous les exercices existants de +1
                    await prisma.exerciseTemplate.updateMany({
                        where: { sessionTemplateId: template.id },
                        data: { orderInSession: { increment: 1 } },
                    });

                    // Ajouter le cardio en position 0
                    await prisma.exerciseTemplate.create({
                        data: {
                            sessionTemplateId: template.id,
                            exerciseId: exerciseId,
                            sets: 1,
                            reps: 1,
                            duration: duration,
                            orderInSession: 0,
                        },
                    });
                } else {
                    // Ajouter le cardio en dernière position
                    await prisma.exerciseTemplate.create({
                        data: {
                            sessionTemplateId: template.id,
                            exerciseId: exerciseId,
                            sets: 1,
                            reps: 1,
                            duration: duration,
                            orderInSession: maxOrder + 1,
                        },
                    });
                }
            }

            return { success: true, message: 'Exercice cardio ajouté à tous les templates' };
        });
    }

    // 🆕 Supprimer tous les exercices cardio d'un programme
    async removeCardioFromProgram(programId: number, userId: number) {
        const program = await this.prisma.trainingProgram.findUnique({
            where: { id: programId },
            include: {
                fitnessProfile: true,
                sessionTemplates: true,
            },
        });

        if (!program) {
            throw new BadRequestException('Programme introuvable');
        }

        this.verifyPermissions(program.fitnessProfile.userId, userId, 'ce programme');

        return this.prisma.$transaction(async (prisma) => {
            await this.removeCardioFromAllTemplates(prisma, program.sessionTemplates.map(t => t.id));
            return { success: true, message: 'Exercices cardio supprimés de tous les templates' };
        });
    }

    // Helper privé pour supprimer les exercices cardio de multiples templates
    private async removeCardioFromAllTemplates(prisma: any, templateIds: number[]) {
        // Récupérer tous les IDs d'exercices de type CARDIO
        const cardioExercises = await prisma.exercice.findMany({
            where: { type: 'CARDIO' },
            select: { id: true },
        });

        const cardioExerciseIds = cardioExercises.map((e: { id: number }) => e.id);

        if (cardioExerciseIds.length === 0) return;

        // Supprimer tous les ExerciseTemplates qui sont des exercices cardio
        await prisma.exerciseTemplate.deleteMany({
            where: {
                sessionTemplateId: { in: templateIds },
                exerciseId: { in: cardioExerciseIds },
            },
        });

        // Réordonner les exercices restants pour chaque template
        for (const templateId of templateIds) {
            const remainingExercises = await prisma.exerciseTemplate.findMany({
                where: { sessionTemplateId: templateId },
                orderBy: { orderInSession: 'asc' },
            });

            for (let i = 0; i < remainingExercises.length; i++) {
                await prisma.exerciseTemplate.update({
                    where: { id: remainingExercises[i].id },
                    data: { orderInSession: i },
                });
            }
        }
    }

}
