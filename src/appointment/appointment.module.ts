import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsService } from './appointment.service';
import { AppointmentsController } from './appointment.controller';
import { Appointment } from './entities/appointment.entity'; 
import { Location } from '@/location/entities/location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Location])],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}

