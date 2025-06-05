import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consultation } from './consultation.entity';
import { Pricing } from './pricing.entity';
import { ConsultationService } from './consultation.service';
import { ConsultationController } from './consultation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Consultation, Pricing])],
  providers: [ConsultationService],
  controllers: [ConsultationController],
})
export class ConsultationModule {}
