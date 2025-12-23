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
                description: true,
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
                                orderInSession: true,
                                exercise: {
                                    select: {
                                        id: true,
                                        name: true,
                                        imageUrl: true,
                                        bodyWeight: true,
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
                description: true,
                status: true,
                createdAt: true,
                template: true,
                startDate: true,
                // Pour les programmes archivés, on peut limiter les sessions
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

    // 🔧 LEGACY: Garde pour compatibilité (peut être supprimée plus tard)
    async getProgramsByUser(userId: number) {
        return this.prisma.trainingProgram.findMany({
            where: { fitnessProfile: { userId } },
            select: {
                id: true,
                name: true,
                description: true,
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
        const program = await this.iaService.generateProgram(fitnessProfile);

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
                    description: dto.description ?? '',
                    fitnessProfileId: dto.fitnessProfileId,
                    template: program.template as ProgramTemplate,
                    status: 'ACTIVE',
                    startDate: startDate || new Date(),
                },
            });

            // ✅ Créer UNIQUEMENT les SessionTemplate (modèles réutilisables)
            // Les TrainingSession seront créées à la demande via startFromTemplate
            for (let i = 0; i < program.sessions.length; i++) {
                const session = program.sessions[i];

                // Créer le template
                const sessionTemplate = await prisma.sessionTemplate.create({
                    data: {
                        programId: createdProgram.id,
                        name: session.name,
                        orderInProgram: i,
                    },
                });

                // Créer les ExerciseTemplate
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
                    description: createProgramDto.description ?? '',
                    fitnessProfileId: createProgramDto.fitnessProfileId,
                    template: 'CUSTOM' as ProgramTemplate,
                    status: 'ACTIVE',
                    startDate: startDate || new Date(),
                },
            });

            // ✅ Créer UNIQUEMENT les templates (pas d'instances)
            for (let i = 0; i < sessions.length; i++) {
                const session = sessions[i];

                // Créer le template
                const sessionTemplate = await prisma.sessionTemplate.create({
                    data: {
                        programId: createdProgram.id,
                        name: session.name ?? `Session ${i + 1}`,
                        orderInProgram: i,
                    },
                });

                // Créer les ExerciseTemplate
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
            const createdSession = await prisma.trainingSession.create({
                data: { programId, sessionName: sessionData.name ?? '' },
            });

            for (const ex of sessionData.exercises) {
                await prisma.exerciceSession.create({
                    data: {
                        sessionId: createdSession.id,
                        exerciceId: ex.id,
                        sets: ex.sets ?? 3,
                        reps: ex.reps ?? 8,
                        weight: ex.weight ?? null,
                    },
                });
            }


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
                description: dto.description,
            },
            include: { sessions: { include: { exercices: true } } },
        });
    }

}
