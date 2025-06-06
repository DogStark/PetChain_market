import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { VaccinationRecord } from './entities/vaccination-record.entity';
import { VaccinationSchedule } from './entities/vaccination-schedule.entity';
import { VaccinationTemplate } from './entities/vaccination-template.entity';
import { Pet } from '../pets/entities/pet.entity';
import { VaccinationService } from './services/vaccination.service';
import { VaccinationReminderService } from './services/vaccination-reminder.service';
import { VaccinationCertificateService } from './services/vaccination-certificate.service';
import { VaccinationController } from './controllers/vaccination.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VaccinationRecord,
      VaccinationSchedule,
      VaccinationTemplate,
      Pet,
    ]),
    ScheduleModule.forRoot(),
    MailerModule,
  ],
  controllers: [VaccinationController],
  providers: [
    VaccinationService,
    VaccinationReminderService,
    VaccinationCertificateService,
  ],
  exports: [VaccinationService],
})
export class VaccinationModule {}