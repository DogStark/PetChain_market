import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateGroomingPackageDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
