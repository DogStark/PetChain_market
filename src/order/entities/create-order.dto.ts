import {
  IsNotEmpty,
  IsUUID,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNotEmpty()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @IsUUID()
  @IsOptional()
  subscriptionId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
