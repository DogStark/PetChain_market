import { IsNotEmpty, IsUUID, IsOptional, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsNotEmpty()
  street: string;

  @IsNotEmpty()
  city: string;

  @IsNotEmpty()
  state: string;

  @IsNotEmpty()
  zipCode: string;

  @IsNotEmpty()
  country: string;
}

export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  cartId: string;

  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  billingAddress?: AddressDto;

  @IsOptional()
  notes?: string;
}
