import { IsString, IsNumber, IsEnum, IsOptional, IsPositive, IsNotEmpty, Min, Max, IsDecimal } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  species: string;

  @IsString()
  @IsOptional()
  breed?: string;

  @IsNumber()
  @IsPositive()
  @Min(0)
  @Max(50)
  age: number;

  @IsEnum(['male', 'female', 'unknown'])
  @IsOptional()
  gender?: string = 'unknown';

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(0.1)
  @Max(1000)
  weight: number;

  @IsNumber()
  @IsPositive()
  ownerId: number;
}
