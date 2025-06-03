import { IsNotEmpty, IsString } from 'class-validator';

export class CancelOrderDto {
  @IsNotEmpty()
  @IsString()
  reason: string;
}
