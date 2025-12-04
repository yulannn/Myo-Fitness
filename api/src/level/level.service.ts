import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class LevelService {
    constructor(private prisma: PrismaService) { }

    private readonly XP_PER_LEVEL = 200;
    private readonly XP_PER_SESSION = 50;

    async getLevelByUserId(userId: number) {
        let leveling = await this.prisma.leveling.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePictureUrl: true,
                    },
                },
            },
        });

        if (!leveling) {
            leveling = await this.initializeLeveling(userId);
            leveling = await this.prisma.leveling.findUnique({
                where: { userId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profilePictureUrl: true,
                        },
                    },
                },
            });
        }

        return leveling;
    }

    async initializeLeveling(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        const existingLeveling = await this.prisma.leveling.findUnique({
            where: { userId },
        });

        if (existingLeveling) {
            return existingLeveling;
        }

        return this.prisma.leveling.create({
            data: {
                userId,
                level: 1,
                experience: 0,
                nextLevelExp: this.XP_PER_LEVEL,
            },
        });
    }

    async addExperienceFromSession(userId: number, sessionId: number) {
        const session = await this.prisma.trainingSession.findUnique({
            where: { id: sessionId },
            include: {
                trainingProgram: {
                    include: {
                        fitnessProfile: true,
                    },
                },
            },
        });

        if (!session) {
            throw new NotFoundException(`Session ${sessionId} not found`);
        }

        if (session.trainingProgram.fitnessProfile.userId !== userId) {
            throw new NotFoundException("Session does not belong to this user");
        }

        if (!session.completed) {
            throw new Error("Session must be completed to gain experience");
        }

        let leveling = await this.prisma.leveling.findUnique({
            where: { userId },
        });

        if (!leveling) {
            leveling = await this.initializeLeveling(userId);
        }

        return this.addExperience(userId, this.XP_PER_SESSION);
    }


    async addExperience(userId: number, xpAmount: number) {
        let leveling = await this.prisma.leveling.findUnique({
            where: { userId },
        });

        if (!leveling) {
            leveling = await this.initializeLeveling(userId);
        }

        const newTotalExperience = leveling.experience + xpAmount;
        const newLevel = Math.floor(newTotalExperience / this.XP_PER_LEVEL) + 1;

        return this.prisma.leveling.update({
            where: { userId },
            data: {
                experience: newTotalExperience,
                level: newLevel,
                nextLevelExp: this.XP_PER_LEVEL,
            },
        });
    }

    async getUserStats(userId: number) {
        const leveling = await this.getLevelByUserId(userId);

        const totalSessions = await this.prisma.trainingSession.count({
            where: {
                trainingProgram: {
                    fitnessProfile: {
                        userId,
                    },
                },
                completed: true,
            },
        });

        const xpInCurrentLevel = leveling.experience % this.XP_PER_LEVEL;
        const progressPercentage = (xpInCurrentLevel / this.XP_PER_LEVEL) * 100;

        return {
            ...leveling,
            totalCompletedSessions: totalSessions,
            xpInCurrentLevel,
            progressPercentage: Math.round(progressPercentage * 100) / 100,
            xpToNextLevel: this.XP_PER_LEVEL - xpInCurrentLevel,
        };
    }
}