import { IsUUID, IsInt, IsPositive, IsOptional, IsString } from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  productId: string;

  @IsString()
  productName: string;

  @IsPositive()
  price: number;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}
