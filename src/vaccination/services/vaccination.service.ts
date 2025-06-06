import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { VaccinationRecord } from '../entities/vaccination-record.entity';
import { VaccinationSchedule, VaccinationStatus } from '../entities/vaccination-schedule.entity';
import { VaccinationTemplate } from '../entities/vaccination-template.entity';
import { Pet } from '../../pets/entities/pet.entity';
import { CreateVaccinationRecordDto } from '../dto/create-vaccination-record.dto';
import { CreateVaccinationScheduleDto } from '../dto/create-vaccination-schedule.dto';

@Injectable()
export class VaccinationService {
  constructor(
    @InjectRepository(VaccinationRecord)
    private vaccinationRecordRepository: Repository<VaccinationRecord>,
    @InjectRepository(VaccinationSchedule)
    private vaccinationScheduleRepository: Repository<VaccinationSchedule>,
    @InjectRepository(VaccinationTemplate)
    private vaccinationTemplateRepository: Repository<VaccinationTemplate>,
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
  ) {}

  async createVaccinationRecord(dto: CreateVaccinationRecordDto): Promise<VaccinationRecord> {
    const pet = await this.petRepository.findOne({ where: { id: dto.petId } });
    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    const record = this.vaccinationRecordRepository.create(dto);
    const savedRecord = await this.vaccinationRecordRepository.save(record);

    await this.updateScheduledVaccination(dto.petId, dto.vaccineName, dto.administeredDate);

    return savedRecord;
  }

  async createVaccinationSchedule(dto: CreateVaccinationScheduleDto): Promise<VaccinationSchedule> {
    const pet = await this.petRepository.findOne({ where: { id: dto.petId } });
    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    const schedule = this.vaccinationScheduleRepository.create(dto);
    return await this.vaccinationScheduleRepository.save(schedule);
  }

  async getPetVaccinationHistory(petId: string): Promise<VaccinationRecord[]> {
    return await this.vaccinationRecordRepository.find({
      where: { petId, isActive: true },
      order: { administeredDate: 'DESC' },
    });
  }

  async getPetVaccinationSchedule(petId: string): Promise<VaccinationSchedule[]> {
    return await this.vaccinationScheduleRepository.find({
      where: { petId },
      order: { scheduledDate: 'ASC' },
    });
  }

  async getUpcomingVaccinations(days: number = 7): Promise<VaccinationSchedule[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return await this.vaccinationScheduleRepository.find({
      where: {
        scheduledDate: Between(today, futureDate),
        status: VaccinationStatus.SCHEDULED,
      },
      relations: ['pet'],
    });
  }

  async getOverdueVaccinations(): Promise<VaccinationSchedule[]> {
    const today = new Date();
    
    const overdueSchedules = await this.vaccinationScheduleRepository.find({
      where: {
        scheduledDate: LessThan(today),
        status: VaccinationStatus.SCHEDULED,
      },
      relations: ['pet'],
    });

    for (const schedule of overdueSchedules) {
      schedule.status = VaccinationStatus.OVERDUE;
      await this.vaccinationScheduleRepository.save(schedule);
    }

    return overdueSchedules;
  }

  async createScheduleFromTemplate(petId: string, templateId: string): Promise<VaccinationSchedule[]> {
    const pet = await this.petRepository.findOne({ where: { id: petId } });
    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    const template = await this.vaccinationTemplateRepository.findOne({
      where: { id: templateId, isActive: true },
    });
    if (!template) {
      throw new NotFoundException('Vaccination template not found');
    }

    if (template.species.toLowerCase() !== pet.species.toLowerCase()) {
      throw new BadRequestException('Template species does not match pet species');
    }

    const schedules: VaccinationSchedule[] = [];
    const petAgeInWeeks = this.calculatePetAgeInWeeks(pet.dateOfBirth);

    for (const vaccination of template.vaccinations) {
      const scheduledDate = new Date();
      
      if (vaccination.ageInWeeks > petAgeInWeeks) {
        const weeksToAdd = vaccination.ageInWeeks - petAgeInWeeks;
        scheduledDate.setDate(scheduledDate.getDate() + (weeksToAdd * 7));
      } else {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      }

      const schedule = this.vaccinationScheduleRepository.create({
        petId,
        vaccineName: vaccination.vaccineName,
        vaccineType: vaccination.vaccineType,
        scheduledDate,
        notes: `Generated from template: ${template.name}`,
      });

      schedules.push(await this.vaccinationScheduleRepository.save(schedule));
    }

    return schedules;
  }

  private async updateScheduledVaccination(petId: string, vaccineName: string, administeredDate: Date): Promise<void> {
    const scheduledVaccination = await this.vaccinationScheduleRepository.findOne({
      where: {
        petId,
        vaccineName,
        status: VaccinationStatus.SCHEDULED,
      },
    });

    if (scheduledVaccination) {
      scheduledVaccination.status = VaccinationStatus.COMPLETED;
      await this.vaccinationScheduleRepository.save(scheduledVaccination);
    }
  }

  private calculatePetAgeInWeeks(dateOfBirth: Date): number {
    const today = new Date();
    const ageInMs = today.getTime() - dateOfBirth.getTime();
    const ageInDays = ageInMs / (1000 * 60 * 60 * 24);
    return Math.floor(ageInDays / 7);
  }
}
