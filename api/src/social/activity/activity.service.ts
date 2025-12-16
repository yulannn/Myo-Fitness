import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ActivityType } from '@prisma/client';

@Injectable()
export class ActivityService {
    constructor(private prisma: PrismaService) { }

    async createActivity(userId: number, type: ActivityType, data: any, tx?: any) {
        // Utiliser la transaction si fournie, sinon prisma normal
        const prisma = tx || this.prisma;

        // Check if user has enabled sharing
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { shareActivities: true },
        });

        if (!user || !user.shareActivities) {
            return null;
        }

        return prisma.activity.create({
            data: {
                userId,
                type,
                data,
            },
        });
    }

    async getFeed(userId: number, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        // Get friends IDs
        const friends = await this.prisma.friend.findMany({
            where: {
                OR: [{ userId: userId }, { friendId: userId }],
                status: 'ACCEPTED',
            },
            select: {
                userId: true,
                friendId: true,
            },
        });

        const friendIds = friends.map((f) =>
            f.userId === userId ? f.friendId : f.userId,
        );

        // Always include own activities in feed? Or just friends? Spec says "Les activités des amis". 
        // Usually strava includes own too. Let's include both for now? Spec says: "Activités des amis".
        // Let's stick to friends + self for a good feed experience if friends count is low.

        const targetIds = [...friendIds, userId];

        const activities = await this.prisma.activity.findMany({
            where: {
                userId: { in: targetIds },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
            skip,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePictureUrl: true,
                        level: true
                    }
                },
                reactions: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
        });

        return activities;
    }

    async toggleReaction(userId: number, activityId: number, emoji: string) {
        // Check if reaction exists
        const existing = await this.prisma.activityReaction.findUnique({
            where: {
                activityId_userId: {
                    activityId,
                    userId,
                },
            },
        });

        if (existing) {
            // If same emoji, remove it (toggle off)
            // If different emoji, update it? Spec says "1 reaction par utilisateur". 
            // Let's assume toggle behavior for same emoji, update for different.

            if (existing.emoji === emoji) {
                return this.prisma.activityReaction.delete({
                    where: { id: existing.id }
                });
            } else {
                return this.prisma.activityReaction.update({
                    where: { id: existing.id },
                    data: { emoji }
                });
            }
        } else {
            return this.prisma.activityReaction.create({
                data: {
                    activityId,
                    userId,
                    emoji
                }
            });
        }
    }
}
