import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateTrainingProgramDto } from './dto/create-program.dto';
import { PrismaService } from 'prisma/prisma.service';
import { IaService } from 'src/ia/ia.service';
import type { ProgramTemplate } from '@prisma/client';
import { CreateManualProgramDto } from './dto/create-manual-program.dto';
import { AddSessionToProgramDto } from './dto/add-session-program.dto';
const MAX_SESSIONS_PER_PROGRAM = 7;

@Injectable()
export class ProgramService {
    constructor(private prisma: PrismaService, private iaService: IaService) { }

    // Recupere tout les programmes d'un utilisateur
    async getProgramsByUser(userId: number) {
        return this.prisma.trainingProgram.findMany(
            {
                where: { fitnessProfile: { userId } },
                include: {
                    sessions: {
                        where: { completed: false },
                        include: {
                            exercices: {
                                include: {
                                    exercice: true,
                                    performances: true // Inclure les performances pour afficher les données réelles
                                }
                            }
                        },
                    },
                },
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

            const createdProgram = await prisma.trainingProgram.create({
                data: {
                    name: dto.name,
                    description: dto.description ?? '',
                    fitnessProfileId: dto.fitnessProfileId,
                    template: program.template as ProgramTemplate,
                    status: 'ACTIVE',
                },
            });

            for (const session of program.sessions) {
                const createdSession = await prisma.trainingSession.create({
                    data: { programId: createdProgram.id, notes: session.name },
                });

                for (const ex of session.exercises) {
                    await prisma.exerciceSession.create({
                        data: {
                            sessionId: createdSession.id,
                            exerciceId: typeof ex === 'number' ? ex : ex.id,
                            sets: typeof ex === 'object' ? (ex.sets ?? 3) : 3,
                            reps: typeof ex === 'object' ? (ex.reps ?? 8) : 8,
                        },
                    });
                }
            }

            return prisma.trainingProgram.findUnique({
                where: { id: createdProgram.id },
                include: { sessions: { include: { exercices: true } } },
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
            const createdProgram = await prisma.trainingProgram.create({
                data: {
                    name: createProgramDto.name,
                    description: createProgramDto.description ?? '',
                    fitnessProfileId: createProgramDto.fitnessProfileId,
                    template: 'CUSTOM' as ProgramTemplate,
                    status: 'ACTIVE',
                },
            });

            for (const session of sessions) {
                const createdSession = await prisma.trainingSession.create({
                    data: { programId: createdProgram.id, notes: session.name ?? '' },
                });

                if (session.exercises && Array.isArray(session.exercises)) {
                    for (const ex of session.exercises) {
                        const exerciceId = typeof ex === 'number' ? ex : ex.id;
                        if (!exerciceId) continue;
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
                }
            }

            return prisma.trainingProgram.findUnique({
                where: { id: createdProgram.id },
                include: { sessions: { include: { exercices: true } } },
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

        const sessionNumber = await this.prisma.trainingSession.count({ where: { programId } });
        if (sessionNumber >= MAX_SESSIONS_PER_PROGRAM)
            throw new BadRequestException('Le programme a déjà le nombre maximum de sessions.');

        return this.prisma.$transaction(async (prisma) => {
            const createdSession = await prisma.trainingSession.create({
                data: { programId, notes: sessionData.name ?? '' },
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

}
