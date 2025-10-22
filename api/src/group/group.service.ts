import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class GroupService {
    constructor(private prisma: PrismaService) { }

    async sendGroupRequest(senderId: number, groupId: number) {


        const group = await this.prisma.friendGroup.findUnique({
            where: { id: groupId },
        });
        if (!group) {
            throw new Error('Group not found');
        }
    }

}
