import { Injectable, ConflictException } from '@nestjs/common';
import { CreateFitnessProfileDto } from './dto/create-fitness-profile.dto';
import { UpdateFitnessProfileDto } from './dto/update-fitness-profile.dto';
import { PrismaService } from 'prisma/prisma.service';
import { FitnessProfileEntity } from './entities/fitness-profile.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class FitnessProfileService {
    constructor(private prisma: PrismaService) { }

    async create(createFitnessProfileDto: CreateFitnessProfileDto, userId: number): Promise<FitnessProfileEntity> {
        const existingProfile = await this.prisma.fitnessProfile.findFirst({
            where: { userId },
        });

        if (existingProfile) {
            throw new ConflictException('Un profil existe déjà pour cet utilisateur.');
        }

        try {
            const profile = await this.prisma.fitnessProfile.create({
                data: {
                    ...createFitnessProfileDto,
                    userId,
                    weightHistory: { create: { weight: createFitnessProfileDto.weight } },
                },
            });
            return profile as FitnessProfileEntity;
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                throw new ConflictException('Un profil existe déjà pour cet utilisateur.');
            }
            throw err;
        }
    }

    findAll(userId: number): Promise<FitnessProfileEntity[]> {
        const profiles = this.prisma.fitnessProfile.findMany({
            where: {
                userId,
            },
        });

        if (!profiles) {
            throw new Error('No fitness profiles found');
        }
        return profiles;
    }

    async findOne(id: number, userId: number): Promise<FitnessProfileEntity> {
        const profile = await this.prisma.fitnessProfile.findFirst({
            where: {
                id: Number(id),
                userId: userId,
            },
            include: { weightHistory: true },
        });

        if (!profile) {
            throw new Error('Fitness profile not found');
        }

        return profile as FitnessProfileEntity;
    }


    async update(id: number, updateFitnessProfileDto: UpdateFitnessProfileDto, userId: number): Promise<FitnessProfileEntity> {

        const lastWeight = await this.prisma.weightHistory.findFirst({
            where: {
                fitnessProfileId: id,
            },
            orderBy: {
                date: 'desc',
            },
            take: 1,
        });

        if (updateFitnessProfileDto.weight && updateFitnessProfileDto.weight !== lastWeight?.weight) {
            await this.prisma.weightHistory.create({
                data: {
                    fitnessProfileId: id,
                    weight: updateFitnessProfileDto.weight,
                },
            });
        }

        const existing = await this.prisma.fitnessProfile.findFirst({
            where: {
                id: Number(id),
                userId: userId,
            },
        });
        if (!existing) {
            throw new Error('Fitness profile not found');
        }

        const profile = await this.prisma.fitnessProfile.update({
            where: { id: Number(id) },
            data: updateFitnessProfileDto,
        });
        return profile as FitnessProfileEntity;
    }

    remove(id: number) {
        return this.prisma.fitnessProfile.delete({
            where: { id: Number(id) },
        });
    }
}
