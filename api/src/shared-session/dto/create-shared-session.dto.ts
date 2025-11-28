import { IsString, IsOptional, IsDateString, IsInt, Min } from 'class-validator';

export class CreateSharedSessionDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    startTime: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsInt()
    @Min(1)
    @IsOptional()
    maxParticipants?: number;

    @IsInt()
    @IsOptional()
    groupId?: number;
}
