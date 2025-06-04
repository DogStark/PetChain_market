import { IsNotEmpty, IsString, IsEmail, IsOptional, IsObject } from 'class-validator';

export class CustomerDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsObject()
  @IsOptional()
  billingAddress?: Record<string, any>;

  @IsObject()
  @IsOptional()
  shippingAddress?: Record<string, any>;
}