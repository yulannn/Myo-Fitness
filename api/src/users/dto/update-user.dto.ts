import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserDto {
    @ApiProperty({ description: 'Partager automatiquement les activités', required: false })
    @IsBoolean()
    @IsOptional()
    shareActivities?: boolean;

    @ApiProperty({ description: 'Nom de l\'utilisateur', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    // Add other fields as needed later
}
