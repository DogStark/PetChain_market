import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class ComparisonDto {
  @ApiProperty({
    description: 'Array of product IDs to compare',
    example: ['uuid1', 'uuid2', 'uuid3'],
  })
  @IsArray()
  @IsUUID(4, { each: true })
  @ArrayMinSize(2)
  @ArrayMaxSize(5)
  productIds: string[];
}
