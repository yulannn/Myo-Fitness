import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateSharedSessionDto } from './dto/create-shared-session.dto';
import { ChatGateway } from '../chat/chat.gateway';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

@Injectable()
export class SharedSessionService {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => ChatGateway))
        private chatGateway: ChatGateway,
    ) { }

    async create(userId: number, dto: CreateSharedSessionDto) {
        // Si groupId est fourni, vérifier que l'utilisateur est membre du groupe
        if (dto.groupId) {
            const isMember = await this.prisma.friendGroup.findFirst({
                where: {
                    id: dto.groupId,
                    members: {
                        some: { id: userId },
                    },
                },
            });

            if (!isMember) {
                throw new BadRequestException('User is not a member of this group');
            }
        }

        const session = await this.prisma.sharedSession.create({
            data: {
                title: dto.title,
                description: dto.description,
                startTime: new Date(dto.startTime),
                location: dto.location,
                maxParticipants: dto.maxParticipants,
                organizerId: userId,
                groupId: dto.groupId,
                participants: {
                    create: {
                        userId: userId, // L'organisateur participe automatiquement
                    },
                },
            },
            include: {
                organizer: {
                    select: { id: true, name: true, profilePictureUrl: true },
                },
                participants: {
                    include: {
                        user: {
                            select: { id: true, name: true, profilePictureUrl: true },
                        },
                    },
                },
                group: {
                    select: { id: true, name: true },
                },
            },
        });

        // Envoyer les notifications WebSocket
        if (dto.groupId) {
            // Récupérer les membres du groupe pour les notifier
            const group = await this.prisma.friendGroup.findUnique({
                where: { id: dto.groupId },
                include: { members: true },
            });

            if (group) {
                const memberIds = group.members
                    .map(m => m.id)
                    .filter(id => id !== userId); // Exclure l'organisateur

                this.chatGateway.notifySessionCreated(session, memberIds);
            }
        }

        return session;
    }

    async findAll(userId: number) {
        return this.prisma.sharedSession.findMany({
            where: {
                OR: [
                    { organizerId: userId },
                    { participants: { some: { userId } } },
                    {
                        group: {
                            members: { some: { id: userId } },
                        },
                    },
                ],
            },
            include: {
                organizer: {
                    select: { id: true, name: true, profilePictureUrl: true },
                },
                participants: {
                    include: {
                        user: {
                            select: { id: true, name: true, profilePictureUrl: true },
                        },
                    },
                },
                group: {
                    select: {
                        id: true,
                        name: true,
                        members: {
                            select: {
                                id: true,
                                name: true,
                                profilePictureUrl: true,
                            }
                        }
                    },
                },
            },
            orderBy: {
                startTime: 'asc',
            },
        });
    }

    async join(userId: number, sessionId: string) {
        const session = await this.prisma.sharedSession.findUnique({
            where: { id: sessionId },
            include: { participants: true },
        });

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        if (session.maxParticipants && session.participants.length >= session.maxParticipants) {
            throw new BadRequestException('Session is full');
        }

        const isParticipant = session.participants.some((p) => p.userId === userId);
        if (isParticipant) {
            throw new BadRequestException('User already joined this session');
        }

        const result = await this.prisma.sharedSessionParticipant.create({
            data: {
                sharedSessionId: sessionId,
                userId: userId,
            },
            include: {
                sharedSession: true,
                user: {
                    select: { id: true, name: true },
                },
            },
        });

        const participantIds = session.participants
            .map(p => p.userId)
            .filter(id => id !== userId);

        this.chatGateway.notifySessionJoined(
            sessionId,
            userId,
            result.user.name,
            participantIds,
        );

        return result;
    }

    async leave(userId: number, sessionId: string) {
        const participant = await this.prisma.sharedSessionParticipant.findUnique({
            where: {
                sharedSessionId_userId: {
                    sharedSessionId: sessionId,
                    userId: userId,
                },
            },
            include: {
                user: {
                    select: { name: true },
                },
                sharedSession: {
                    include: {
                        participants: true,
                    },
                },
            },
        });

        if (!participant) {
            throw new NotFoundException('Participant not found');
        }

        const result = await this.prisma.sharedSessionParticipant.delete({
            where: {
                id: participant.id,
            },
        });

        const participantIds = participant.sharedSession.participants
            .map(p => p.userId)
            .filter(id => id !== userId);

        this.chatGateway.notifySessionLeft(
            sessionId,
            userId,
            participant.user.name,
            participantIds,
        );

        return result;
    }

    async delete(userId: number, sessionId: string) {
        const session = await this.prisma.sharedSession.findUnique({
            where: { id: sessionId },
            include: {
                participants: true,
            },
        });

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        if (session.organizerId !== userId) {
            throw new BadRequestException('Only organizer can delete the session');
        }

        const participantIds = session.participants
            .map(p => p.userId)
            .filter(id => id !== userId);

        this.chatGateway.notifySessionDeleted(sessionId, participantIds);

        return this.prisma.sharedSession.delete({
            where: { id: sessionId },
        });
    }

    async inviteGroup(userId: number, sessionId: string, groupId: number) {
        // Vérifier que la session existe et que l'user est l'organisateur
        const session = await this.prisma.sharedSession.findUnique({
            where: { id: sessionId },
            include: {
                organizer: {
                    select: { id: true, name: true },
                },
            },
        });

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        if (session.organizerId !== userId) {
            throw new BadRequestException('Only organizer can invite groups');
        }

        // Mettre à jour la session avec le groupe
        const updatedSession = await this.prisma.sharedSession.update({
            where: { id: sessionId },
            data: { groupId },
            include: {
                organizer: {
                    select: { id: true, name: true, profilePictureUrl: true },
                },
                participants: {
                    include: {
                        user: {
                            select: { id: true, name: true, profilePictureUrl: true },
                        },
                    },
                },
                group: {
                    select: {
                        id: true,
                        name: true,
                        members: {
                            select: {
                                id: true,
                                name: true,
                                profilePictureUrl: true,
                            }
                        }
                    },
                },
            },
        });

        if (!updatedSession.group) {
            throw new NotFoundException('Group not found');
        }

        // Récupérer/créer la conversation du groupe
        let conversation = await this.prisma.conversation.findFirst({
            where: { groupId: groupId },
        });

        if (!conversation) {
            conversation = await this.prisma.conversation.create({
                data: {
                    name: updatedSession.group.name,
                    type: 'GROUP',
                    groupId: groupId,
                    participants: {
                        create: updatedSession.group.members.map(member => ({
                            userId: member.id,
                        })),
                    },
                },
            });
        }

        // Envoyer un message système dans le chat du groupe
        const formattedDate = format(new Date(session.startTime), "d MMMM yyyy 'à' HH:mm", { locale: fr });
        const messageContent = `📅 INVITATION: ${session.organizer.name} propose une séance de groupe : "${session.title}" le ${formattedDate} à ${session.location || 'lieu non précisé'}. SESSION_ID:${sessionId}`;

        await this.prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: userId,
                content: messageContent,
            },
        });

        // Notifier les membres via WebSocket
        const memberIds = updatedSession.group.members
            .map(m => m.id)
            .filter(id => id !== userId);

        this.chatGateway.notifySessionCreated(updatedSession, memberIds);

        return updatedSession;
    }

    async inviteFriend(userId: number, sessionId: string, friendId: number) {
        // 1. Vérifier que la session existe et que l'user est l'organisateur
        const session = await this.prisma.sharedSession.findUnique({
            where: { id: sessionId },
            include: {
                organizer: { select: { id: true, name: true } },
            },
        });

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        if (session.organizerId !== userId) {
            throw new BadRequestException('Only organizer can invite friends');
        }

        // 2. Trouver ou créer la conversation privée entre organisateur et ami
        let conversation = await this.prisma.conversation.findFirst({
            where: {
                type: 'PRIVATE',
                participants: {
                    every: {
                        userId: { in: [userId, friendId] }
                    }
                }
            },
        });

        if (!conversation) {
            // Créer la conversation privée
            conversation = await this.prisma.conversation.create({
                data: {
                    type: 'PRIVATE',
                    participants: {
                        create: [
                            { userId: userId },
                            { userId: friendId },
                        ],
                    },
                },
            });
        }

        // 3. Envoyer le message d'invitation avec pattern reconnaissable
        const formattedDate = format(new Date(session.startTime), "d MMMM yyyy 'à' HH:mm", { locale: fr });
        const messageContent = `📅 INVITATION: ${session.organizer.name} vous invite à "${session.title}" le ${formattedDate} à ${session.location || 'lieu non précisé'}. SESSION_ID:${sessionId}`;

        await this.prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: userId,
                content: messageContent,
            },
        });

        // 4. Notifier via WebSocket
        const fullSession = await this.prisma.sharedSession.findUnique({
            where: { id: sessionId },
            include: {
                organizer: {
                    select: { id: true, name: true, profilePictureUrl: true },
                },
                participants: {
                    include: {
                        user: {
                            select: { id: true, name: true, profilePictureUrl: true },
                        },
                    },
                },
                group: {
                    select: { id: true, name: true },
                },
            },
        });

        this.chatGateway.notifySessionCreated(fullSession, [friendId]);

        return { success: true };
    }
}
