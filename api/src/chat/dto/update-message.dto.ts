import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMessageDto {
    @ApiProperty({ maxLength: 10000 })
    @IsString()
    @MaxLength(10000)
    content: string;
}
