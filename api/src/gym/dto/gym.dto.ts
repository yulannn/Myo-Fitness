import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateGymDto {
    @IsString()
    @IsNotEmpty()
    osmId: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsNumber()
    @IsNotEmpty()
    lat: number;

    @IsNumber()
    @IsNotEmpty()
    lng: number;
}

export class FindOrCreateGymDto {
    @IsString()
    @IsNotEmpty()
    osmId: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsNumber()
    @IsNotEmpty()
    lat: number;

    @IsNumber()
    @IsNotEmpty()
    lng: number;
}
