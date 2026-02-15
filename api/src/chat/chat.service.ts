import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { AddReactionDto } from './dto/add-reaction.dto';
import { ConversationType, MessageType } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // ========== CONVERSATIONS ==========

  async createConversation(dto: CreateConversationDto, creatorId: number) {
    // Vérifier que le créateur est inclus dans les participants
    if (!dto.participantIds.includes(creatorId)) {
      dto.participantIds.push(creatorId);
    }

    // Pour une conversation privée, il ne peut y avoir que 2 participants
    if (
      dto.type === ConversationType.PRIVATE &&
      dto.participantIds.length !== 2
    ) {
      throw new BadRequestException(
        'Private conversations must have exactly 2 participants',
      );
    }

    // Vérifier si une conversation privée existe déjà entre ces utilisateurs
    if (dto.type === ConversationType.PRIVATE) {
      const existing = await this.findExistingPrivateConversation(
        dto.participantIds[0],
        dto.participantIds[1],
      );
      if (existing) {
        return existing;
      }
    }

    // Si c'est une conversation de groupe, vérifier que le groupe existe et que l'utilisateur en fait partie
    if (dto.groupId) {
      const group = await this.prisma.friendGroup.findFirst({
        where: {
          id: dto.groupId,
          members: { some: { id: creatorId } },
        },
      });

      if (!group) {
        throw new ForbiddenException('You are not a member of this group');
      }
    }

    const conversation = await this.prisma.conversation.create({
      data: {
        type: dto.type,
        groupId: dto.groupId,
        name: dto.name,
        participants: {
          create: dto.participantIds.map((userId) => ({
            userId,
          })),
        },
      },
      include: {
        participants: {
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
        },
      },
    });

    return conversation;
  }

  async getUserConversations(userId: number) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
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
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                profilePictureUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Ajouter le nombre de messages non lus pour chaque conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.participants.find((p) => p.userId === userId);
        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conv.id,
            createdAt: { gt: participant?.lastReadAt ?? new Date(0) },
            senderId: { not: userId },
          },
        });

        return {
          ...conv,
          lastMessage: conv.messages[0] || null,
          unreadCount,
        };
      }),
    );

    return conversationsWithUnread;
  }

  async getConversation(conversationId: string, userId: number) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
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
        },
        group: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    const isParticipant = conversation.participants.some(
      (p) => p.userId === userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException(
        'You are not a participant of this conversation',
      );
    }

    return conversation;
  }

  async leaveConversation(conversationId: string, userId: number) {
    const conversation = await this.getConversation(conversationId, userId);

    // Supprimer la participation
    await this.prisma.conversationParticipant.deleteMany({
      where: {
        conversationId,
        userId,
      },
    });

    // Si c'était le dernier participant, supprimer la conversation
    const remainingParticipants =
      await this.prisma.conversationParticipant.count({
        where: { conversationId },
      });

    if (remainingParticipants === 0) {
      await this.prisma.conversation.delete({ where: { id: conversationId } });
    }

    return { message: 'Left conversation successfully' };
  }

  // ========== MESSAGES ==========

  async getMessages(
    conversationId: string,
    userId: number,
    skip = 0,
    take = 50,
  ) {
    // Vérifier l'accès
    await this.getConversation(conversationId, userId);

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    return messages.reverse(); // Retourner dans l'ordre chronologique
  }

  async sendMessage(dto: SendMessageDto, senderId: number) {
    // Vérifier l'accès
    await this.getConversation(dto.conversationId, senderId);

    const message = await this.prisma.message.create({
      data: {
        conversationId: dto.conversationId,
        senderId,
        content: dto.content,
        type: dto.type === MessageType.SYSTEM ? MessageType.TEXT : dto.type,
        mediaUrl: dto.mediaUrl,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true,
          },
        },
        reactions: true,
      },
    });

    // Mettre à jour le timestamp de la conversation
    await this.prisma.conversation.update({
      where: { id: dto.conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async updateMessage(
    messageId: string,
    dto: UpdateMessageDto,
    userId: number,
  ) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: dto.content,
        isEdited: true,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true,
          },
        },
        reactions: true,
      },
    });
  }

  async deleteMessage(messageId: string, userId: number) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        content: '[Message deleted]',
      },
    });
  }

  async markAsRead(conversationId: string, userId: number) {
    await this.getConversation(conversationId, userId);

    await this.prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    return { message: 'Marked as read' };
  }

  // ========== REACTIONS ==========

  async addReaction(dto: AddReactionDto, userId: number) {
    const message = await this.prisma.message.findUnique({
      where: { id: dto.messageId },
      include: { conversation: true },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Vérifier que l'utilisateur a accès à cette conversation
    await this.getConversation(message.conversationId, userId);

    // Vérifier si la réaction existe déjà
    const existing = await this.prisma.messageReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId: dto.messageId,
          userId,
          emoji: dto.emoji,
        },
      },
    });

    if (existing) {
      // Supprimer la réaction (toggle)
      await this.prisma.messageReaction.delete({
        where: { id: existing.id },
      });
      return { message: 'Reaction removed' };
    }

    // Ajouter la réaction
    await this.prisma.messageReaction.create({
      data: {
        messageId: dto.messageId,
        userId,
        emoji: dto.emoji,
      },
    });

    return { message: 'Reaction added' };
  }

  // ========== HELPERS ==========

  private async findExistingPrivateConversation(
    user1Id: number,
    user2Id: number,
  ) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        type: ConversationType.PRIVATE,
        participants: {
          some: { userId: user1Id },
        },
      },
      include: {
        participants: true,
      },
    });

    return conversations.find((conv) => {
      const participantIds = conv.participants.map((p) => p.userId);
      return participantIds.includes(user2Id) && participantIds.length === 2;
    });
  }
}
