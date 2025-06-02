import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalHistory } from './entities/medical.entity';
import { PetService } from '@/pet/pet.service';
import { CreateMedicalHistoryDto } from './dto/create-medical-history.dto';
import { UpdateMedicalHistoryDto } from './dto/update-medical-history.dto';

@Injectable()
export class MedicalHistoryService {
  constructor(
    @InjectRepository(MedicalHistory)
    private medicalHistoryRepository: Repository<MedicalHistory>,
    private petsService: PetService,
  ) {}

  async create(
    createDto: CreateMedicalHistoryDto,
    userId: string,
  ): Promise<MedicalHistory> {
    // Verify user has access to the pet
    await this.petsService.findOne(createDto.petId, userId);

    const medicalHistory = this.medicalHistoryRepository.create({
      ...createDto,
      date: new Date(createDto.date),
      createdById: userId,
    });

    return this.medicalHistoryRepository.save(medicalHistory);
  }

  async findByPet(petId: string, userId: string): Promise<MedicalHistory[]> {
    // Verify user has access to the pet
    await this.petsService.findOne(petId, userId);

    return this.medicalHistoryRepository.find({
      where: { petId },
      order: { date: 'DESC' },
      relations: ['createdBy'],
    });
  }

  async findOne(id: string, userId: string): Promise<MedicalHistory> {
    const medicalHistory = await this.medicalHistoryRepository.findOne({
      where: { id },
      relations: ['pet', 'createdBy'],
    });

    if (!medicalHistory) {
      throw new NotFoundException('Medical history record not found');
    }

    // Verify user has access to the pet
    await this.petsService.findOne(medicalHistory.petId, userId);

    return medicalHistory;
  }

  async update(
    id: string,
    updateDto: UpdateMedicalHistoryDto,
    userId: string,
  ): Promise<MedicalHistory> {
    const medicalHistory = await this.findOne(id, userId);

    if (updateDto.date) {
      updateDto.date = new Date(updateDto.date);
    }

    Object.assign(medicalHistory, updateDto);
    return this.medicalHistoryRepository.save(medicalHistory);
  }

  async remove(id: string, userId: string): Promise<void> {
    const medicalHistory = await this.findOne(id, userId);
    await this.medicalHistoryRepository.remove(medicalHistory);
  }
}
