import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from './entities/medical_record.entity';

@Injectable()
export class MedicalRecordService {
  constructor(
    @InjectRepository(MedicalRecord)
    private readonly recordRepository: Repository<MedicalRecord>,
  ) {}

  // New method for initial records
  async createInitialRecord(petId: number, data: Partial<MedicalRecord>) {
    return this.recordRepository.save({
      petId,
      ...data,
      createdAt: new Date(),
    });
  }
}