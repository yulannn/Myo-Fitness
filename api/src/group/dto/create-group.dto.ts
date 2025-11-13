import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ description: 'Nom du groupe', example: 'Fitness Buddies' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Description du groupe',
    example: 'Groupe pour les passionnés de fitness',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
