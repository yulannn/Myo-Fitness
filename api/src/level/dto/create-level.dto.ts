import { IsEnum, IsInt, IsString, IsOptional } from "class-validator";
import { Leveling } from "@prisma/client";

export class CreateLevelDto {
    @IsInt()
    level: number;

    @IsInt()
    experience: number;

    @IsInt()
    nextLevelExp: number;

    @IsInt()
    userId: number;

    @IsString()
    @IsOptional()
    description?: string;
}
