import { ApiProperty } from '@nestjs/swagger';
import { Conversation, ConversationType } from '@prisma/client';

export class ConversationEntity implements Conversation {
    @ApiProperty()
    id: string;

    @ApiProperty({ enum: ConversationType })
    type: ConversationType;

    @ApiProperty({ required: false })
    groupId: number | null;

    @ApiProperty({ required: false })
    name: string | null;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty({ required: false })
    participants?: any[];

    @ApiProperty({ required: false })
    messages?: any[];

    @ApiProperty({ required: false })
    unreadCount?: number;

    @ApiProperty({ required: false })
    lastMessage?: any;
}
