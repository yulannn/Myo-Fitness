import { IsEnum, IsInt, IsOptional, IsString, } from 'class-validator';
import { GroupStatus } from '@prisma/client';

export class CreateGroupDto {
    @IsString()
    name: string;
    
    @IsInt()
    groupId: number;
    
    @IsString()
    @IsOptional()
    description?: string; 
}