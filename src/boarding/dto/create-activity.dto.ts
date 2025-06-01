import {
    IsString,
    IsEnum,
    IsDateString,
    IsOptional,
    IsInt,
    IsObject,
    IsArray,
    IsUrl,
    Min,
    Max,
    MaxLength,
    IsNumber,
    IsBoolean,
    ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '../entities/activity.entity';

class ActivityMetadataDto {
    @ApiPropertyOptional({
        description: 'Amount of food given',
        example: '1 cup dry food'
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    foodAmount?: string;

    @ApiPropertyOptional({
        description: 'Walking distance in meters',
        minimum: 0,
        maximum: 10000
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(10000)
    walkDistance?: number;

    @ApiPropertyOptional({
        description: 'Medication given',
        example: 'Arthritis medication - 1 tablet'
    })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    medicationGiven?: string;

    @ApiPropertyOptional({
        description: 'Pet mood during activity',
        enum: ['happy', 'calm', 'anxious', 'playful', 'tired']
    })
    @IsOptional()
    @IsEnum(['happy', 'calm', 'anxious', 'playful', 'tired'])
    mood?: 'happy' | 'calm' | 'anxious' | 'playful' | 'tired';

    @ApiPropertyOptional({
        description: 'Pet energy level',
        enum: ['low', 'medium', 'high']
    })
    @IsOptional()
    @IsEnum(['low', 'medium', 'high'])
    energyLevel?: 'low' | 'medium' | 'high';

    @ApiPropertyOptional({
        description: 'Additional notes about the activity',
        maxLength: 500
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;

    @ApiPropertyOptional({
        description: 'Pet temperature (°C)',
        minimum: 35,
        maximum: 42
    })
    @IsOptional()
    @IsNumber()
    @Min(35)
    @Max(42)
    temperature?: number;

    @ApiPropertyOptional({
        description: 'Pet weight (kg)',
        minimum: 0.1,
        maximum: 100
    })
    @IsOptional()
    @IsNumber()
    @Min(0.1)
    @Max(100)
    weight?: number;
}

export class CreateActivityDto {
    @ApiProperty({
        description: 'Activity type',
        enum: ActivityType,
        example: ActivityType.WALKING
    })
    @IsEnum(ActivityType, { message: 'Activity type must be a valid enum value' })
    type!: ActivityType;

    @ApiProperty({
        description: 'Activity title',
        minLength: 3,
        maxLength: 100,
        example: 'Morning walk in the park'
    })
    @IsString()
    @MaxLength(100)
    title!: string;

    @ApiProperty({
        description: 'Activity description',
        minLength: 10,
        maxLength: 1000,
        example: 'Took Max for a 30-minute walk around the facility grounds. He was very energetic and enjoyed sniffing around.'
    })
    @IsString()
    @MaxLength(1000)
    description!: string;

    @ApiProperty({
        description: 'Activity time',
        format: 'date-time',
        example: '2024-01-15T10:30:00Z'
    })
    @IsDateString({}, { message: 'Activity time must be a valid ISO date string' })
    @Transform(({ value }) => new Date(value).toISOString())
    activityTime!: string;

    @ApiPropertyOptional({
        description: 'Duration in minutes',
        minimum: 1,
        maximum: 480,
        example: 30
    })
    @IsOptional()
    @IsInt()
    @Min(1, { message: 'Duration must be at least 1 minute' })
    @Max(480, { message: 'Duration cannot exceed 8 hours' })
    duration?: number;

    @ApiPropertyOptional({
        description: 'Additional metadata about the activity',
        type: ActivityMetadataDto
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => ActivityMetadataDto)
    metadata?: ActivityMetadataDto;

    @ApiPropertyOptional({
        description: 'Photo URLs related to this activity',
        type: [String],
        example: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg']
    })
    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true, message: 'Each photo URL must be valid' })
    photoUrls?: string[];

    @ApiPropertyOptional({
        description: 'Whether this activity should be visible to pet owners',
        default: true
    })
    @IsOptional()
    @IsBoolean()
    isVisible?: boolean;
  }