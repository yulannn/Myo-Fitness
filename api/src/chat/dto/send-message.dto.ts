import { IsString, IsEnum, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { MessageType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
    @ApiProperty()
    @IsUUID()
    conversationId: string;

    @ApiProperty({ maxLength: 10000 })
    @IsString()
    @MaxLength(10000)
    content: string;

    @ApiPropertyOptional({ enum: MessageType, default: MessageType.TEXT })
    @IsOptional()
    @IsEnum(MessageType)
    type?: MessageType = MessageType.TEXT;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    mediaUrl?: string;
}
