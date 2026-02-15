import { ApiProperty } from '@nestjs/swagger';
import { Message, MessageType } from '@prisma/client';

export class MessageEntity implements Message {
  @ApiProperty()
  id: string;

  @ApiProperty()
  conversationId: string;

  @ApiProperty()
  senderId: number;

  @ApiProperty()
  content: string;

  @ApiProperty({ enum: MessageType })
  type: MessageType;

  @ApiProperty({ required: false })
  mediaUrl: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  isEdited: boolean;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty({ required: false })
  sender?: any;

  @ApiProperty({ required: false })
  reactions?: any[];
}
