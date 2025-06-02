import { PartialType } from '@nestjs/swagger';
import { CreateEmergencyBookingDto } from './create-emergency-booking.dto';

export class UpdateEmergencyBookingDto extends PartialType(CreateEmergencyBookingDto) {}
