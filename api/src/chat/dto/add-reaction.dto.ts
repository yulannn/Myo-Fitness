import { IsString, IsUUID, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddReactionDto {
    @ApiProperty()
    @IsUUID()
    messageId: string;

    @ApiProperty({ description: 'Emoji (single character or shortcode)' })
    @IsString()
    @Matches(/^[\u{1F300}-\u{1F9FF}]|^:\w+:$/u, {
        message: 'Must be a valid emoji'
    })
    emoji: string;
}
