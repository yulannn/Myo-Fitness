import { Injectable, ForbiddenException } from '@nestjs/common';
import { CreateFriendDto } from './dto/create-friend.dto';
import { PrismaService } from 'prisma/prisma.service';
import { ChatService } from '../chat/chat.service';
import { ChatGateway } from '../chat/chat.gateway';
import { ConversationType } from '@prisma/client';
import { R2Service } from '../r2/r2.service';

@Injectable()
export class FriendService {
  constructor(
    private prisma: PrismaService,
    private chatService: ChatService,
    private chatGateway: ChatGateway,
    private r2Service: R2Service,
  ) { }

  async searchUsers(query: string, currentUserId: number) {
    if (!query || query.length < 2) return [];

    // 1️⃣ Rechercher les utilisateurs par code ami uniquement
    const users = await this.prisma.user.findMany({
      where: {
        friendCode: { equals: query, mode: 'insensitive' }, // Recherche exacte (mais insensible à la casse au cas où)
        NOT: { id: currentUserId },
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePictureUrl: true,
      },
      take: 10,
    });

    // Si aucun utilisateur trouvé, retourner vide
    if (users.length === 0) return [];

    // Extraire les IDs pour les requêtes bulk
    const userIds = users.map(u => u.id);

    // 2️⃣ ✅ OPTIMISATION : Récupérer TOUS les friends et requests en 2 requêtes
    const [friends, requests] = await Promise.all([
      // Récupérer toutes les relations d'amitié en une seule requête
      this.prisma.friend.findMany({
        where: {
          OR: [
            { userId: currentUserId, friendId: { in: userIds } },
            { friendId: currentUserId, userId: { in: userIds } }
          ]
        },
        select: {
          userId: true,
          friendId: true,
        }
      }),
      // Récupérer toutes les demandes d'ami en une seule requête
      this.prisma.friendRequest.findMany({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: { in: userIds } },
            { receiverId: currentUserId, senderId: { in: userIds } }
          ],
          status: 'PENDING',
        },
        select: {
          senderId: true,
          receiverId: true,
        }
      })
    ]);

    // 3️⃣ ✅ Créer des Maps pour lookup O(1) au lieu de O(N)
    const friendMap = new Map<number, boolean>();
    const requestMap = new Map<number, { sent: boolean }>();

    // Remplir le Map des amis
    friends.forEach(f => {
      const otherUserId = f.userId === currentUserId ? f.friendId : f.userId;
      friendMap.set(otherUserId, true);
    });

    // Remplir le Map des requêtes
    requests.forEach(r => {
      const otherUserId = r.senderId === currentUserId ? r.receiverId : r.senderId;
      requestMap.set(otherUserId, {
        sent: r.senderId === currentUserId
      });
    });

    // 4️⃣ ✅ Mapper les résultats en mémoire (très rapide)
    const results = users.map(user => {
      let status = 'NONE';

      if (friendMap.has(user.id)) {
        status = 'FRIEND';
      } else if (requestMap.has(user.id)) {
        const request = requestMap.get(user.id)!;
        status = request.sent ? 'SENT' : 'RECEIVED';
      }

      return { ...user, status };
    });

    return results;
  }

  async sendFriendRequest(createFriendDto: CreateFriendDto, userId: number) {
    const { friendId } = createFriendDto;

    if (userId === friendId) {
      throw new Error("You cannot add yourself as a friend");
    }

    const existingRequest = await this.prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId }
        ],
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      throw new Error('Friend request already pending');
    }

    const existingFriend = await this.prisma.friend.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: friendId },
          { userId: friendId, friendId: userId }
        ]
      }
    });

    if (existingFriend) {
      throw new Error("You are already friends");
    }

    const friendRequest = await this.prisma.friendRequest.create({
      data: {
        senderId: userId,
        receiverId: friendId,
        status: 'PENDING',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    // Notifier le destinataire en temps réel via WebSocket
    this.chatGateway.notifyFriendRequestReceived(friendId, friendRequest);

    return friendRequest;
  }

  async acceptFriendRequest(requestId: string, userId: number) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    if (!request) {
      throw new Error('Friend request not found');
    }

    // ✅ SÉCURITÉ : Vérifier que c'est bien le destinataire qui accepte
    if (request.receiverId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez accepter que les demandes qui vous sont adressées'
      );
    }

    // Créer les relations d'amitié
    await this.prisma.friend.createMany({
      data: [
        { userId: request.senderId, friendId: request.receiverId },
        { userId: request.receiverId, friendId: request.senderId },
      ],
      skipDuplicates: true,
    });

    await this.prisma.friendRequest.delete({
      where: { id: requestId },
    });

    // Notifier l'expéditeur que sa demande a été acceptée
    // Générer une URL signée pour la photo de profil si elle existe
    let profilePictureUrl = request.receiver.profilePictureUrl;
    if (profilePictureUrl && !profilePictureUrl.startsWith('http')) {
      // Si c'est un chemin relatif (ex: profile-pictures/xxx.jpeg), générer l'URL signée
      try {
        // Nettoyer le chemin : enlever le / au début si présent
        const cleanPath = profilePictureUrl.startsWith('/')
          ? profilePictureUrl.substring(1)
          : profilePictureUrl;
        profilePictureUrl = await this.r2Service.generatePresignedViewUrl(cleanPath);
      } catch (error) {
        console.error('Error generating signed URL:', error);
        profilePictureUrl = null;
      }
    }

    this.chatGateway.notifyFriendRequestAccepted(request.senderId, {
      id: request.receiver.id,
      name: request.receiver.name,
      profilePictureUrl,
    });

    // Créer automatiquement une conversation privée
    try {
      await this.chatService.createConversation(
        {
          type: ConversationType.PRIVATE,
          participantIds: [request.senderId, request.receiverId],
        },
        request.senderId, // Initiateur (peu importe ici)
      );
    } catch (error) {
      console.error('Error creating conversation after friend accept:', error);
      // On ne bloque pas l'acceptation d'ami si la création de chat échoue
    }

    return { message: 'Friend request accepted' };
  }

  async declineFriendRequest(requestId: string, userId: number) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    if (!request) {
      throw new Error('Friend request not found');
    }

    // ✅ SÉCURITÉ : Vérifier que c'est bien le destinataire qui refuse
    if (request.receiverId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez refuser que les demandes qui vous sont adressées'
      );
    }

    await this.prisma.friendRequest.delete({
      where: { id: requestId },
    });

    // Notifier l'expéditeur que sa demande a été refusée
    this.chatGateway.notifyFriendRequestDeclined(request.senderId, request.receiver);

    return { message: 'Friend request declined' };
  }

  async getPendingFriendRequest(userId: number) {
    const requests = await this.prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true
          }
        }
      }
    });

    return requests;
  }

  async getFriendsList(userId: number) {
    const friendList = await this.prisma.friend.findMany({
      where: {
        userId: userId
      },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePictureUrl: true
          }
        }
      }
    });

    if (!friendList) {
      return [];
    }
    return friendList;
  }
  async removeFriend(userId: number, friendId: number) {
    // 1. Trouver la conversation privée entre les deux utilisateurs
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        type: ConversationType.PRIVATE,
        participants: {
          every: {
            userId: { in: [userId, friendId] },
          },
        },
      },
    });

    // 2. Si une conversation existe, la supprimer (ceci supprimera aussi les messages via Cascade)
    if (conversation) {
      // Notifier les clients que la conversation est supprimée (optionnel mais recommandé pour mettre à jour l'UI en temps réel)
      // this.chatGateway.server.to(conversation.id).emit('conversation:deleted', conversation.id); // Si besoin

      await this.prisma.conversation.delete({
        where: { id: conversation.id },
      });
    }

    // 3. Supprimer les deux sens de la relation d'amitié
    await this.prisma.friend.deleteMany({
      where: {
        OR: [
          { userId: userId, friendId: friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    return { message: 'Friend removed successfully' };
  }

  /**
   * Get all sent friend requests for a user
   */
  async getSentFriendRequests(userId: number) {
    const requests = await this.prisma.friendRequest.findMany({
      where: {
        senderId: userId,
        status: 'PENDING',
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    return requests;
  }

  /**
   * Cancel a sent friend request
   */
  async cancelFriendRequest(requestId: string, userId: number) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Friend request not found');
    }

    if (request.senderId !== userId) {
      throw new Error('Unauthorized to cancel this request');
    }

    await this.prisma.friendRequest.delete({
      where: { id: requestId },
    });

    return { message: 'Friend request cancelled successfully' };
  }
}
