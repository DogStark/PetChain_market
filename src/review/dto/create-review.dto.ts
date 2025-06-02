import { IsInt, IsOptional, IsString, Min, Max, ValidateIf } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  content!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ValidateIf((o) => !o.serviceId)
  @IsInt()
  @IsOptional()
  productId?: number;

  @ValidateIf((o) => !o.productId)
  @IsInt()
  @IsOptional()
  serviceId?: number;

}
