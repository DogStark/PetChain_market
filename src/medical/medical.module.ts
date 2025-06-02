import { PetModule } from '@/pet/pet.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalHistory } from './entities/medical.entity';
import { MedicalHistoryController } from './medical.controller';
import { MedicalHistoryService } from './medical.service';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalHistory]), PetModule],
  controllers: [MedicalHistoryController],
  providers: [MedicalHistoryService],
})
export class MedicalModule {}
