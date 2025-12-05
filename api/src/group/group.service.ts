import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from 'prisma/prisma.service';
import { ChatService } from '../chat/chat.service';
import { ConversationType } from '@prisma/client';

@Injectable()
export class GroupService {
    constructor(
        private prisma: PrismaService,
        private chatService: ChatService
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

        return this.prisma.friendGroupRequest.create({
            data: {
                senderId,
                receiverId,
                groupId,
                status: 'PENDING',
            },
        });
    }

    async acceptGroupRequest(requestId: string) {
        const request = await this.prisma.friendGroupRequest.findUnique({
            where: { id: requestId },
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
        const group = await this.prisma.friendGroup.update({
            where: { id: groupId },
            data: { name },
        });

        // Mettre à jour le nom de la conversation associée
        const conversation = await this.prisma.conversation.findFirst({
            where: { groupId: groupId }
        });

        if (conversation) {
            await this.prisma.conversation.update({
                where: { id: conversation.id },
                data: { name: name }
            });
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

        if (conversation) {
            await this.prisma.conversationParticipant.deleteMany({
                where: {
                    conversationId: conversation.id,
                    userId: userIdToRemove
                }
            });
        }

        return { message: 'Member removed successfully' };
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
