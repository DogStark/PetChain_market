import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateBookingDto } from './create-booking.dto';
import {
    IsOptional,
    IsEnum,
    IsDateString,
    IsString,
    MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '../entities/booking.entity';

export class UpdateBookingDto extends PartialType(
    OmitType(CreateBookingDto, ['petId', 'facilityId'] as const)
) {
    @ApiPropertyOptional({
        description: 'Booking status',
        enum: BookingStatus
    })
    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;

    @ApiPropertyOptional({
        description: 'Updated start date',
        format: 'date'
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({
        description: 'Updated end date',
        format: 'date'
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({
        description: 'Reason for update',
        maxLength: 500
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    updateReason?: string;
}