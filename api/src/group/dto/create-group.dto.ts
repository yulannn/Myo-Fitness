import { IsEnum, IsOptional, IsString, } from 'class-validator';
import { GroupStatus } from '@prisma/client';

export class CreateGroupDto {
    @IsString()
    name: string;
 

    @IsString()
    @IsOptional()
    description?: string;
    
}