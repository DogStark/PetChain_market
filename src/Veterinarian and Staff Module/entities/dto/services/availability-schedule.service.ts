import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AvailabilitySchedule, DayOfWeek } from '../entities/availability-schedule.entity';
import { CreateAvailabilityScheduleDto } from '../dto/create-availability-schedule.dto';

@Injectable()
export class AvailabilityScheduleService {
  constructor(
    @InjectRepository(AvailabilitySchedule)
    private scheduleRepository: Repository<AvailabilitySchedule>,
  ) {}

  async create(createScheduleDto: CreateAvailabilityScheduleDto): Promise<AvailabilitySchedule> {
    const schedule = this.scheduleRepository.create(createScheduleDto);
    return this.scheduleRepository.save(schedule);
  }

  async findByVeterinarian(veterinarianId: number): Promise<AvailabilitySchedule[]> {
    return this.scheduleRepository.find({
      where: { veterinarianId, isActive: true },
      order: { dayOfWeek: 'ASC', startTime: 'ASC' }
    });
  }

  async findByDay(dayOfWeek: DayOfWeek): Promise<AvailabilitySchedule[]> {
    return this.scheduleRepository.find({
      where: { dayOfWeek, isActive: true },
      relations: ['veterinarian'],
      order: { startTime: 'ASC' }
    });
  }

  async update(id: number, updateData: Partial<CreateAvailabilityScheduleDto>): Promise<AvailabilitySchedule> {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });
    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    Object.assign(schedule, updateData);
    return this.scheduleRepository.save(schedule);
  }

  async remove(id: number): Promise<void> {
    const result = await this.scheduleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
  }
}