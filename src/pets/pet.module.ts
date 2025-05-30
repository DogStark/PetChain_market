import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pet } from './entities/pet.entity';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';
import { MedicalRecordService } from '../medical_record/medical_record.service'; // Add this
import { MedicalRecord } from '../medical_record/entities/medical_record.entity'; // Add this

@Module({
  imports: [TypeOrmModule.forFeature([Pet, MedicalRecord])], // Include MedicalRecord
  controllers: [PetController],
  providers: [PetService, MedicalRecordService], // Add MedicalRecordService
})
export class PetModule {}