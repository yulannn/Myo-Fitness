import { IsString, IsOptional, IsDateString, IsInt, Min, IsNumber } from 'class-validator';

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

    // Champs pour la salle de sport
    @IsString()
    @IsOptional()
    gymName?: string;

    @IsString()
    @IsOptional()
    gymAddress?: string;

    @IsNumber()
    @IsOptional()
    gymLat?: number;

    @IsNumber()
    @IsOptional()
    gymLng?: number;
}
