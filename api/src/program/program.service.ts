import { Injectable } from '@nestjs/common';
import { CreateTrainingProgramDto } from './dto/create-program.dto';
import { PrismaService } from 'prisma/prisma.service';
import { IaService } from 'src/ia/ia.service';
import type { ProgramTemplate } from '@prisma/client';
import { CreateManualProgramDto } from './dto/create-manual-program.dto';

@Injectable()
export class ProgramService {
    constructor(
        private prisma: PrismaService,
        private iaService: IaService,
    ) { }

    async create(createProgramDto: CreateTrainingProgramDto, userId: number) {
        const fitnessProfile = await this.validateFitnessProfile(
            createProgramDto.fitnessProfileId,
            userId,
        );
        const program = await this.generateValidatedProgram(fitnessProfile);
        const validatedExercises = await this.validateExercisesExist(
            program.sessions,
        );

        return this.persistProgram(createProgramDto, program, validatedExercises);
    }

    private async validateFitnessProfile(profileId: number, userId: number) {
        const profile = await this.prisma.fitnessProfile.findFirst({
            where: { id: profileId, userId },
        });
        if (!profile) throw new Error('Fitness profile not found for this user');
        return profile;
    }

    private async generateValidatedProgram(fitnessProfile: any) {
        const program = await this.iaService.generateProgram(fitnessProfile);
        if (!program) throw new Error('Program generation failed');
        return program;
    }

    private async validateExercisesExist(sessions: any[]) {
        const allExerciseIds = new Set<number>();
        for (const s of sessions)
            for (const ex of s.exercises)
                allExerciseIds.add(typeof ex === 'number' ? ex : ex.id);

        const found = await this.prisma.exercice.findMany({
            where: { id: { in: [...allExerciseIds] } },
            select: { id: true },
        });

        const foundIds = new Set(found.map((e) => e.id));
        const missing = [...allExerciseIds].filter((id) => !foundIds.has(id));

        if (missing.length)
            throw new Error(`Missing exercises: ${missing.join(', ')}`);
        return [...foundIds];
    }

    private async persistProgram(
        dto: CreateTrainingProgramDto,
        program: any,
        exerciseIds: number[],
    ) {
        return this.prisma.$transaction(async (prisma) => {
            const createdProgram = await prisma.trainingProgram.create({
                data: {
                    name: dto.name,
                    description: dto.description ?? '',
                    fitnessProfileId: dto.fitnessProfileId,
                    template: program.template as ProgramTemplate,
                },
            });

            for (const session of program.sessions) {
                const createdSession = await prisma.trainingSession.create({
                    data: {
                        programId: createdProgram.id,
                        notes: session.name,
                    },
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
        const { createProgramDto, sessionData } = body;

        const fitnessProfile = await this.validateFitnessProfile(
            createProgramDto.fitnessProfileId,
            userId,
        );

        if (!fitnessProfile) {
            throw new Error('Fitness profile not found for this user');
        }

        return this.prisma.$transaction(async (prisma) => {
            const createdProgram = await prisma.trainingProgram.create({
                data: {
                    name: createProgramDto.name,
                    description: createProgramDto.description ?? '',
                    fitnessProfileId: createProgramDto.fitnessProfileId,
                    template: 'CUSTOM' as ProgramTemplate,
                },
            });

            for (const session of sessionData.sessions) {
                const createdSession = await prisma.trainingSession.create({
                    data: {
                        programId: createdProgram.id,
                        notes: session.name ?? '',
                    },
                });

                if (session.exercises && Array.isArray(session.exercises)) {
                    for (const ex of session.exercises) {
                        const exerciceId = typeof ex === 'number' ? ex : ex.id;
                        if (!exerciceId) continue;

                        await prisma.exerciceSession.create({
                            data: {
                                sessionId: createdSession.id,
                                exerciceId,
                                sets: typeof ex === 'object' ? (ex.sets ?? 3) : 3,
                                reps: typeof ex === 'object' ? (ex.reps ?? 8) : 8,
                            },
                        });
                    }
                }
            }

            return prisma.trainingProgram.findUnique({
                where: { id: createdProgram.id },
                include: {
                    sessions: {
                        include: { exercices: true },
                    },
                },
            });
        });
    }
}
