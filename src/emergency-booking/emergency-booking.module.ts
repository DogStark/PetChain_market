import { Module } from '@nestjs/common';
import { EmergencyBookingService } from './emergency-booking.service';
import { EmergencyBookingController } from './emergency-booking.controller';
import { NotificationModule } from '@/notification/notification.module';
import { PricingModule } from '@/pricing/pricing.module';
import { TriageModule } from '@/triage/triage.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmergencyAppointment } from './entities/emergency-appointment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmergencyAppointment]),
    TriageModule,
    PricingModule,
    NotificationModule,
  ],
  controllers: [EmergencyBookingController],
  providers: [EmergencyBookingService],
  exports: [EmergencyBookingService],
})
export class EmergencyBookingModule {}
