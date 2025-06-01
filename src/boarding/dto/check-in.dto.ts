import {
    IsOptional,
    IsString,
    IsArray,
    IsUrl,
    ValidateNested,
    MaxLength,
    IsEnum,
    IsBoolean,
    IsNumber,
    Min,
    Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum PetCondition {
    EXCELLENT = 'excellent',
    GOOD = 'good',
    FAIR = 'fair',
    POOR = 'poor',
    NEEDS_ATTENTION = 'needs_attention',
}

class CheckInPhotoDto {
    @ApiPropertyOptional({ description: 'Photo URL' })
    @IsUrl({}, { message: 'Must be a valid URL' })
    url!: string;

    @ApiPropertyOptional({
        description: 'Photo caption',
        maxLength: 200,
        example: 'Happy arrival photo'
    })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    caption?: string;

    @ApiPropertyOptional({ description: 'Is this photo a favorite?' })
    @IsOptional()
    @IsBoolean()
    isFavorite?: boolean;
}

class ItemBroughtDto {
    @ApiPropertyOptional({ description: 'Item name' })
    @IsString()
    @MaxLength(100)
    name!: string;

    @ApiPropertyOptional({ description: 'Item description' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    description?: string;

    @ApiPropertyOptional({ description: 'Quantity of items' })
    @IsOptional()
    @IsNumber()
    @Min(1)
    quantity?: number;
}

export class CheckInDto {
    @ApiPropertyOptional({
        description: 'Check-in notes',
        maxLength: 1000,
        example: 'Pet arrived in good spirits, no issues during drop-off'
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    notes?: string;

    @ApiPropertyOptional({
        description: 'Pet condition assessment',
        enum: PetCondition,
        example: PetCondition.GOOD
    })
    @IsOptional()
    @IsEnum(PetCondition)
    petCondition?: PetCondition;

    @ApiPropertyOptional({
        description: 'Check-in photos',
        type: [CheckInPhotoDto]
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CheckInPhotoDto)
    photos?: CheckInPhotoDto[];

    @ApiPropertyOptional({
        description: 'Items brought by owner',
        type: [ItemBroughtDto]
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ItemBroughtDto)
    itemsBrought?: ItemBroughtDto[];

    @ApiPropertyOptional({
        description: 'Pet weight at check-in (kg)',
        minimum: 0.1,
        maximum: 100
    })
    @IsOptional()
    @IsNumber()
    @Min(0.1)
    @Max(100)
    weight?: number;

    @ApiPropertyOptional({
        description: 'Pet temperature at check-in (°C)',
        minimum: 35,
        maximum: 42
    })
    @IsOptional()
    @IsNumber()
    @Min(35)
    @Max(42)
    temperature?: number;

    @ApiPropertyOptional({ description: 'Any behavioral observations' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    behaviorNotes?: string;
  }