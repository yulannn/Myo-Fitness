import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
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

        // Include own activities + friends activities
        const targetIds = [...friendIds, userId];

        // Get total count for pagination
        const total = await this.prisma.activity.count({
            where: {
                userId: { in: targetIds },
            },
        });

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

        return {
            data: activities,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }

    /**
     * 🔒 Récupérer les détails d'une session d'un ami pour l'affichage dans le feed
     * Sécurisé : vérifie que l'utilisateur est ami avec le propriétaire de la session
     */
    async getSessionDetailsForFriend(userId: number, sessionId: number) {
        // 1. Récupérer la session avec son propriétaire
        const session = await this.prisma.trainingSession.findUnique({
            where: { id: sessionId },
            include: {
                trainingProgram: {
                    include: {
                        fitnessProfile: {
                            select: { userId: true }
                        }
                    }
                }
            }
        });

        if (!session) {
            throw new NotFoundException('Session introuvable');
        }

        const sessionOwnerId = session.trainingProgram.fitnessProfile.userId;

        // 2. Vérifier que l'utilisateur est ami avec le propriétaire OU est le propriétaire
        if (sessionOwnerId !== userId) {
            const isFriend = await this.prisma.friend.findFirst({
                where: {
                    OR: [
                        { userId: userId, friendId: sessionOwnerId, status: 'ACCEPTED' },
                        { userId: sessionOwnerId, friendId: userId, status: 'ACCEPTED' },
                    ],
                },
            });

            if (!isFriend) {
                throw new ForbiddenException('Vous n\'êtes pas autorisé à voir cette session');
            }
        }

        // 3. Récupérer les détails de la session (exercices + performances)
        const sessionDetails = await this.prisma.trainingSession.findUnique({
            where: { id: sessionId },
            select: {
                id: true,
                sessionName: true,
                performedAt: true,
                duration: true,
                exercices: {
                    select: {
                        id: true,
                        sets: true,
                        reps: true,
                        weight: true,
                        exercice: {
                            select: {
                                name: true,
                                type: true, // 🆕 Pour détecter cardio
                                groupes: {
                                    where: { isPrimary: true },
                                    select: {
                                        groupe: {
                                            select: { name: true }
                                        }
                                    }
                                }
                            }
                        },
                        performances: {
                            select: {
                                set_index: true,
                                reps_effectuees: true,
                                weight: true,
                                rpe: true,
                                success: true,
                            },
                            orderBy: {
                                set_index: 'asc'
                            }
                        }
                    }
                },
                summary: {
                    select: {
                        totalSets: true,
                        totalReps: true,
                        totalVolume: true,
                        avgRPE: true,
                        caloriesBurned: true,
                        muscleGroups: true,
                    }
                }
            }
        });

        return sessionDetails;
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

