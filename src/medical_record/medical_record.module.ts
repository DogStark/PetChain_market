import { Module } from '@nestjs/common';
import { MedicalRecordController } from './controllers/medical_record.controller';
import { MedicalRecordService } from './services/medical_record.service';

@Module({
  controllers: [MedicalRecordController],
  providers: [MedicalRecordService],
})
export class MedicalRecordModule {}
