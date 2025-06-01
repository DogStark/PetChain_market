import {
    IsString,
    IsDateString,
    IsOptional,
    IsUUID,
    IsNotEmpty,
    IsEmail,
    IsPhoneNumber,
    MinLength,
    MaxLength,
    IsArray,
    ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class EmergencyContactDto {
    @ApiProperty({ description: 'Emergency contact name' })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    name!: string;

    @ApiProperty({ description: 'Emergency contact phone' })
    @IsPhoneNumber()
    phone!: string;

    @ApiProperty({ description: 'Relationship to pet owner' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    relationship!: string;
}

export class CreateBookingDto {
    @ApiProperty({
        description: 'Pet ID',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID(4, { message: 'Pet ID must be a valid UUID' })
    @IsNotEmpty()
    petId!: string;

    @ApiProperty({
        description: 'Boarding facility ID',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174001'
    })
    @IsUUID(4, { message: 'Facility ID must be a valid UUID' })
    @IsNotEmpty()
    facilityId!: string;

    @ApiProperty({
        description: 'Pricing package ID',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174002'
    })
    @IsUUID(4, { message: 'Package ID must be a valid UUID' })
    @IsNotEmpty()
    packageId!: string;

    @ApiProperty({
        description: 'Boarding start date',
        format: 'date',
        example: '2024-01-15'
    })
    @IsDateString({}, { message: 'Start date must be a valid date string' })
    @IsNotEmpty()
    @Transform(({ value }) => new Date(value).toISOString().split('T')[0])
    startDate!: string;

    @ApiProperty({
        description: 'Boarding end date',
        format: 'date',
        example: '2024-01-20'
    })
    @IsDateString({}, { message: 'End date must be a valid date string' })
    @IsNotEmpty()
    @Transform(({ value }) => new Date(value).toISOString().split('T')[0])
    endDate!: string;

    @ApiPropertyOptional({
        description: 'Special instructions for pet care',
        maxLength: 1000,
        example: 'Please give medication twice daily with food'
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: 'Special instructions cannot exceed 1000 characters' })
    specialInstructions?: string;

    @ApiPropertyOptional({
        description: 'Emergency contact information',
        type: EmergencyContactDto
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => EmergencyContactDto)
    emergencyContact?: EmergencyContactDto;

    @ApiPropertyOptional({
        description: 'Additional notes',
        maxLength: 500,
        example: 'First time boarding, may be nervous'
    })
    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Notes cannot exceed 500 characters' })
    notes?: string;

    @ApiPropertyOptional({
        description: 'Additional services requested',
        type: [String],
        example: ['grooming', 'extra_walks']
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    additionalServices?: string[];
  }