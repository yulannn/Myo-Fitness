import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class GroupService {
    constructor(private prisma: PrismaService) { }

   async createGroup(createGroupDto: CreateGroupDto, userId: number) {
        const group = await this.prisma.friendGroup.create({
            data: {
                name: createGroupDto.name,
                members: {
                    connect: { id: userId },  
                },
            },
        });
        return group;
    }

    async sendGroupRequest(userId: number, groupId: number) {
        const existingRequest = await this.prisma.friendGroupRequest.findFirst({
            where: {
                senderId: userId,
                groupId: groupId,
                status: 'PENDING',
            },
        });
        if (existingRequest) {
            throw new ConflictException('Group request already sent');
        }   
        return this.prisma.friendGroupRequest.create({
            data: {
                senderId: userId,
                groupId: groupId,
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
                    connect: { id: request.senderId },
                },
            },
        });
        
        await this.prisma.friendGroupRequest.delete({
            where: { id: requestId },
        });

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
                group: {
                    members: {
                        some: { id: userId },
                    },
                },
                status: 'PENDING',
            },
        });
        return requests;
    }

    async getGroupMembers(groupId: number) {
        const group = await this.prisma.friendGroup.findUnique({
            where: { id: groupId },
            include: { members: true },
        });

        if (!group) {
            throw new NotFoundException('Group not found');
        }

        return group.members;
    }

    async getGroupsList(userId: number) {
        const groups = await this.prisma.friendGroup.findMany({
            where: {
                members: {
                    some: { id: userId },
                },
            },
        });

        return groups;
    }

}
