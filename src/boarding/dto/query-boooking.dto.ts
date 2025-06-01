import {
    IsOptional,
    IsEnum,
    IsDateString,
    IsUUID,
    IsString,
    IsInt,
    Min,
    Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '../entities/booking.entity';

export class QueryBookingDto {
    @ApiPropertyOptional({
        description: 'Filter by booking status',
        enum: BookingStatus
    })
    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;

    @ApiPropertyOptional({
        description: 'Filter by facility ID',
        format: 'uuid'
    })
    @IsOptional()
    @IsUUID(4)
    facilityId?: string;

    @ApiPropertyOptional({
        description: 'Filter by pet ID',
        format: 'uuid'
    })
    @IsOptional()
    @IsUUID(4)
    petId?: string;

    @ApiPropertyOptional({
        description: 'Filter by start date (from)',
        format: 'date'
    })
    @IsOptional()
    @IsDateString()
    startDateFrom?: string;

    @ApiPropertyOptional({
        description: 'Filter by start date (to)',
        format: 'date'
    })
    @IsOptional()
    @IsDateString()
    startDateTo?: string;

    @ApiPropertyOptional({
        description: 'Page number for pagination',
        minimum: 1,
        default: 1
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        minimum: 1,
        maximum: 100,
        default: 10
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Sort by field',
        enum: ['createdAt', 'startDate', 'endDate', 'totalPrice']
    })
    @IsOptional()
    @IsEnum(['createdAt', 'startDate', 'endDate', 'totalPrice'])
    sortBy?: 'createdAt' | 'startDate' | 'endDate' | 'totalPrice' = 'createdAt';

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: ['ASC', 'DESC']
    })
    @IsOptional()
    @IsEnum(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC' = 'DESC';

    @ApiPropertyOptional({
        description: 'Search term for pet name or owner name'
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    search?: string;
  }