import { ConflictException, Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from 'prisma/prisma.service';
import { ChatService } from '../chat/chat.service';
import { ChatGateway } from '../chat/chat.gateway';
import { ConversationType, MessageType } from '@prisma/client';

@Injectable()
export class GroupService {
    constructor(
        private prisma: PrismaService,
        private chatService: ChatService,
        @Inject(forwardRef(() => ChatGateway))
        private chatGateway: ChatGateway,
    ) { }

    async createGroup(createGroupDto: CreateGroupDto, userId: number) {
        const group = await this.prisma.friendGroup.create({
            data: {
                name: createGroupDto.name,
                adminId: userId,
                members: {
                    connect: { id: userId },
                },
            },
        });

        // Créer automatiquement la conversation de groupe
        try {
            await this.chatService.createConversation({
                type: ConversationType.GROUP,
                groupId: group.id,
                name: group.name,
                participantIds: [userId]
            }, userId);
        } catch (error) {
            console.error('Error creating group conversation:', error);
        }

        return group;
    }

    async sendGroupRequest(senderId: number, receiverId: number, groupId: number) {
        const existingRequest = await this.prisma.friendGroupRequest.findFirst({
            where: {
                senderId,
                receiverId,
                groupId,
                status: 'PENDING',
            },
        });

        if (existingRequest) {
            throw new ConflictException('Group request already sent');
        }

        const request = await this.prisma.friendGroupRequest.create({
            data: {
                senderId,
                receiverId,
                groupId,
                status: 'PENDING',
            },
            include: { // Include sender/group data for the notification payload
                group: { select: { name: true } },
                sender: { select: { name: true } }
            }
        });

        // Notify via WebSocket
        this.chatGateway.notifyGroupRequestReceived(receiverId, request);

        return request;
    }

    async acceptGroupRequest(requestId: string) {
        const request = await this.prisma.friendGroupRequest.findUnique({
            where: { id: requestId },
            include: {
                receiver: { select: { name: true } },
                group: { select: { name: true } }
            }
        });

        if (!request) {
            throw new Error('Group request not found');
        }

        await this.prisma.friendGroup.update({
            where: { id: request.groupId },
            data: {
                members: {
                    connect: { id: request.receiverId },
                },
            },
        });

        await this.prisma.friendGroupRequest.delete({
            where: { id: requestId },
        });

        // Ajouter le membre à la conversation du groupe
        const conversation = await this.prisma.conversation.findFirst({
            where: { groupId: request.groupId }
        });

        if (conversation) {
            await this.prisma.conversationParticipant.create({
                data: {
                    conversationId: conversation.id,
                    userId: request.receiverId
                }
            }).catch(e => console.error("Error adding participant to conversation", e));

            // Envoyer message système
            const message = await this.prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    senderId: request.receiverId,
                    content: `${request.receiver.name} a rejoint le groupe`,
                    type: MessageType.SYSTEM,
                },
                include: {
                    sender: { select: { id: true, name: true, profilePictureUrl: true } },
                    reactions: true
                }
            });
            await this.chatGateway.notifyNewMessage(message, conversation.id);
        }

        return { message: 'Group request accepted' };

    }

    async declineGroupRequest(requestId: string) {
        const request = await this.prisma.friendGroupRequest.findUnique({
            where: { id: requestId },
        });

        if (!request) {
            throw new Error('Group request not found');
        }

        await this.prisma.friendGroupRequest.delete({
            where: { id: requestId },
        });

        return { message: 'Group request declined' };
    }

    async getPendingGroupRequests(userId: number) {
        const requests = await this.prisma.friendGroupRequest.findMany({
            where: {
                receiverId: userId,
                status: 'PENDING',
            },
            include: {
                group: {
                    select: { name: true }
                },
                sender: {
                    select: { name: true }
                }
            }
        });
        return requests;
    }

    async getGroupMembers(groupId: number) {
        const group = await this.prisma.friendGroup.findUnique({
            where: { id: groupId },
            include: {
                members: true,
                admin: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePictureUrl: true
                    }
                }
            },
        });

        if (!group) {
            throw new NotFoundException('Group not found');
        }

        return group;
    }

    async getGroupsList(userId: number) {
        const groups = await this.prisma.friendGroup.findMany({
            where: {
                members: {
                    some: { id: userId },
                },
            },
            include: {
                members: true,
                admin: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePictureUrl: true
                    }
                }
            },
        });

        return groups;
    }

    async updateGroup(groupId: number, name: string) {
        // Obtenir l'ancien nom pour le message (et l'adminId)
        const oldGroup = await this.prisma.friendGroup.findUnique({
            where: { id: groupId },
            select: { name: true, adminId: true }
        });

        const group = await this.prisma.friendGroup.update({
            where: { id: groupId },
            data: { name },
        });

        const conversation = await this.prisma.conversation.findFirst({
            where: { groupId: groupId }
        });

        if (conversation && oldGroup && oldGroup.adminId) {
            await this.prisma.conversation.update({
                where: { id: conversation.id },
                data: { name: name }
            });

            // Message système
            const message = await this.prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    senderId: oldGroup.adminId,
                    content: `Le nom du groupe a été modifié : "${oldGroup.name}" ➔ "${name}"`,
                    type: MessageType.SYSTEM,
                },
                include: {
                    sender: { select: { id: true, name: true, profilePictureUrl: true } },
                    reactions: true
                }
            });
            await this.chatGateway.notifyNewMessage(message, conversation.id);
        }

        return group;
    }

    async removeMember(groupId: number, userIdToRemove: number) {
        // Vérifier si le groupe existe
        const group = await this.prisma.friendGroup.findUnique({
            where: { id: groupId },
            include: { members: true }
        });

        if (!group) {
            throw new NotFoundException('Group not found');
        }

        const memberToRemove = await this.prisma.user.findUnique({
            where: { id: userIdToRemove },
            select: { name: true }
        });

        // Retirer du groupe
        await this.prisma.friendGroup.update({
            where: { id: groupId },
            data: {
                members: {
                    disconnect: { id: userIdToRemove }
                }
            }
        });

        // Retirer de la conversation associée
        const conversation = await this.prisma.conversation.findFirst({
            where: { groupId: groupId }
        });

        if (conversation && memberToRemove && group.adminId) {
            // Message système AVANT de supprimer le participant de la convo (sinon il ne le verra ptet pas ? ou on veut qu'il le voie pas ? 
            // "Se fait virer" implies others see it. The removed user won't see it if removed from participants?
            // Usually removed user shouldn't see future messages. So we send message then remove participant.

            const message = await this.prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    senderId: group.adminId, // Admin sends the kick message
                    content: `${memberToRemove.name} a été retiré(e) du groupe`,
                    type: MessageType.SYSTEM,
                },
                include: {
                    sender: { select: { id: true, name: true, profilePictureUrl: true } },
                    reactions: true
                }
            });
            await this.chatGateway.notifyNewMessage(message, conversation.id);

            await this.prisma.conversationParticipant.deleteMany({
                where: {
                    conversationId: conversation.id,
                    userId: userIdToRemove
                }
            });
        }

        return { message: 'Member removed successfully' };
    }

    async leaveGroup(userId: number, groupId: number) {
        // Vérifier si le groupe existe
        const group = await this.prisma.friendGroup.findUnique({
            where: { id: groupId },
            include: { members: true }
        });

        if (!group) {
            throw new NotFoundException('Group not found');
        }

        // Vérifier si c'est l'admin (ne peut pas quitter, doit supprimer ou transférer - pour l'instant bloquer)
        if (group.adminId === userId) {
            throw new ConflictException('Admin cannot leave group. Delete group or transfer ownership.');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { name: true }
        });

        // Retirer du groupe
        await this.prisma.friendGroup.update({
            where: { id: groupId },
            data: {
                members: {
                    disconnect: { id: userId }
                }
            }
        });

        // Retirer de la conversation associée
        const conversation = await this.prisma.conversation.findFirst({
            where: { groupId: groupId }
        });

        if (conversation && user) {
            const message = await this.prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    senderId: userId,
                    content: `${user.name} a quitté le groupe`,
                    type: MessageType.SYSTEM,
                },
                include: {
                    sender: { select: { id: true, name: true, profilePictureUrl: true } },
                    reactions: true
                }
            });
            await this.chatGateway.notifyNewMessage(message, conversation.id);

            await this.prisma.conversationParticipant.deleteMany({
                where: {
                    conversationId: conversation.id,
                    userId: userId
                }
            });
        }

        return { message: 'Left group successfully' };
    }

    async deleteGroup(groupId: number) {
        const group = await this.prisma.friendGroup.findUnique({
            where: { id: groupId },
        });

        if (!group) {
            throw new NotFoundException('Group not found');
        }

        await this.prisma.friendGroup.delete({
            where: { id: groupId },
        });

        return { message: 'Group deleted successfully' };
    }
}
