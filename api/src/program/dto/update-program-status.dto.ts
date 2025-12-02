import { IsEnum } from 'class-validator';
import { ProgramStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProgramStatusDto {
    @ApiProperty({
        description: 'Nouveau statut du programme',
        enum: ProgramStatus,
        example: ProgramStatus.ARCHIVED,
    })
    @IsEnum(ProgramStatus)
    status: ProgramStatus;
}
