import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { TimeSlot, TimeSlotStatus } from '../entities/time-slot.entity';
import { CreateTimeSlotDto } from '../dto/create-time-slot.dto';
import { UpdateTimeSlotDto } from '../dto/update-time-slot.dto';
import * as moment from 'moment';

@Injectable()
export class TimeSlotService {
  constructor(
    @InjectRepository(TimeSlot)
    private timeSlotRepository: Repository<TimeSlot>,
  ) {}

  async create(createTimeSlotDto: CreateTimeSlotDto): Promise<TimeSlot> {
    // Validate time range
    const startTime = new Date(createTimeSlotDto.startTime);
    const endTime = new Date(createTimeSlotDto.endTime);
    
    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Check for overlapping slots
    const existingSlots = await this.findOverlappingSlots(
      startTime,
      endTime,
      createTimeSlotDto.availabilityScheduleId
    );

    if (existingSlots.length > 0) {
      throw new ConflictException('Time slot overlaps with existing slots');
    }

    // Create time slot
    const timeSlot = this.timeSlotRepository.create({
      ...createTimeSlotDto,
      startTime,
      endTime,
      status: createTimeSlotDto.status || TimeSlotStatus.AVAILABLE,
    });

    return this.timeSlotRepository.save(timeSlot);
  }

  async createBatch(createTimeSlotDtos: CreateTimeSlotDto[]): Promise<TimeSlot[]> {
    const timeSlots: TimeSlot[] = [];
    
    // Process each DTO
    for (const dto of createTimeSlotDtos) {
      const startTime = new Date(dto.startTime);
      const endTime = new Date(dto.endTime);
      
      if (startTime >= endTime) {
        throw new BadRequestException(`Invalid time range: ${startTime} - ${endTime}`);
      }
      
      const timeSlot = this.timeSlotRepository.create({
        ...dto,
        startTime,
        endTime,
        status: dto.status || TimeSlotStatus.AVAILABLE,
      });
      
      timeSlots.push(timeSlot);
    }
    
    // Check for overlaps within the batch
    this.checkBatchOverlaps(timeSlots);
    
    // Check for overlaps with existing slots
    for (const slot of timeSlots) {
      const existingSlots = await this.findOverlappingSlots(
        slot.startTime,
        slot.endTime,
        slot.availabilityScheduleId
      );
      
      if (existingSlots.length > 0) {
        throw new ConflictException(`Time slot ${slot.startTime} - ${slot.endTime} overlaps with existing slots`);
      }
    }
    
    // Save all slots
    return this.timeSlotRepository.save(timeSlots);
  }

  async findAll(): Promise<TimeSlot[]> {
    return this.timeSlotRepository.find({
      where: { isActive: true },
      relations: ['availabilitySchedule'],
      order: { startTime: 'ASC' }
    });
  }

  async findOne(id: string): Promise<TimeSlot> {
    const timeSlot = await this.timeSlotRepository.findOne({
      where: { id },
      relations: ['availabilitySchedule']
    });
    
    if (!timeSlot) {
      throw new NotFoundException(`Time slot with ID ${id} not found`);
    }
    
    return timeSlot;
  }

  async findByAvailabilitySchedule(availabilityScheduleId: number): Promise<TimeSlot[]> {
    return this.timeSlotRepository.find({
      where: { availabilityScheduleId, isActive: true },
      order: { startTime: 'ASC' }
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<TimeSlot[]> {
    return this.timeSlotRepository.find({
      where: {
        startTime: MoreThanOrEqual(startDate),
        endTime: LessThanOrEqual(endDate),
        isActive: true
      },
      relations: ['availabilitySchedule'],
      order: { startTime: 'ASC' }
    });
  }

  async findAvailableByDateRange(startDate: Date, endDate: Date): Promise<TimeSlot[]> {
    return this.timeSlotRepository.find({
      where: {
        startTime: MoreThanOrEqual(startDate),
        endTime: LessThanOrEqual(endDate),
        status: TimeSlotStatus.AVAILABLE,
        isActive: true
      },
      relations: ['availabilitySchedule'],
      order: { startTime: 'ASC' }
    });
  }

  async findByVeterinarianAndDateRange(veterinarianId: number, startDate: Date, endDate: Date): Promise<TimeSlot[]> {
    return this.timeSlotRepository.createQueryBuilder('timeSlot')
      .innerJoin('timeSlot.availabilitySchedule', 'schedule')
      .innerJoin('schedule.veterinarian', 'vet')
      .where('vet.id = :veterinarianId', { veterinarianId })
      .andWhere('timeSlot.startTime >= :startDate', { startDate })
      .andWhere('timeSlot.endTime <= :endDate', { endDate })
      .andWhere('timeSlot.isActive = :isActive', { isActive: true })
      .orderBy('timeSlot.startTime', 'ASC')
      .getMany();
  }

  async update(id: string, updateTimeSlotDto: UpdateTimeSlotDto): Promise<TimeSlot> {
    const timeSlot = await this.findOne(id);
    
    // Handle time changes
    let startTime = timeSlot.startTime;
    let endTime = timeSlot.endTime;
    
    if (updateTimeSlotDto.startTime) {
      startTime = new Date(updateTimeSlotDto.startTime);
    }
    
    if (updateTimeSlotDto.endTime) {
      endTime = new Date(updateTimeSlotDto.endTime);
    }
    
    // Validate time range
    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }
    
    // Check for overlapping slots if times changed
    if (updateTimeSlotDto.startTime || updateTimeSlotDto.endTime) {
      const existingSlots = await this.findOverlappingSlots(
        startTime,
        endTime,
        timeSlot.availabilityScheduleId,
        id
      );
      
      if (existingSlots.length > 0) {
        throw new ConflictException('Updated time slot would overlap with existing slots');
      }
    }
    
    // Update time slot
    Object.assign(timeSlot, {
      ...updateTimeSlotDto,
      startTime,
      endTime,
    });
    
    return this.timeSlotRepository.save(timeSlot);
  }

  async remove(id: string): Promise<void> {
    const result = await this.timeSlotRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Time slot with ID ${id} not found`);
    }
  }

  async deactivate(id: string): Promise<TimeSlot> {
    const timeSlot = await this.findOne(id);
    timeSlot.isActive = false;
    return this.timeSlotRepository.save(timeSlot);
  }

  async bookSlot(id: string, appointmentId: string): Promise<TimeSlot> {
    const timeSlot = await this.findOne(id);
    
    if (timeSlot.status !== TimeSlotStatus.AVAILABLE) {
      throw new BadRequestException(`Time slot is not available (current status: ${timeSlot.status})`);
    }
    
    timeSlot.status = TimeSlotStatus.BOOKED;
    timeSlot.appointmentId = appointmentId;
    
    return this.timeSlotRepository.save(timeSlot);
  }

  async blockSlot(id: string, reason?: string): Promise<TimeSlot> {
    const timeSlot = await this.findOne(id);
    
    if (timeSlot.status !== TimeSlotStatus.AVAILABLE) {
      throw new BadRequestException(`Time slot is not available (current status: ${timeSlot.status})`);
    }
    
    timeSlot.status = TimeSlotStatus.BLOCKED;
    if (reason) {
      timeSlot.metadata = { ...timeSlot.metadata, blockReason: reason };
    }
    
    return this.timeSlotRepository.save(timeSlot);
  }

  async markAsBreak(id: string): Promise<TimeSlot> {
    const timeSlot = await this.findOne(id);
    
    if (timeSlot.status !== TimeSlotStatus.AVAILABLE) {
      throw new BadRequestException(`Time slot is not available (current status: ${timeSlot.status})`);
    }
    
    timeSlot.status = TimeSlotStatus.BREAK;
    return this.timeSlotRepository.save(timeSlot);
  }

  async markAsHoliday(id: string): Promise<TimeSlot> {
    const timeSlot = await this.findOne(id);
    
    if (timeSlot.status !== TimeSlotStatus.AVAILABLE) {
      throw new BadRequestException(`Time slot is not available (current status: ${timeSlot.status})`);
    }
    
    timeSlot.status = TimeSlotStatus.HOLIDAY;
    return this.timeSlotRepository.save(timeSlot);
  }

  async releaseSlot(id: string): Promise<TimeSlot> {
    const timeSlot = await this.findOne(id);
    
    if (timeSlot.status === TimeSlotStatus.AVAILABLE) {
      throw new BadRequestException('Time slot is already available');
    }
    
    timeSlot.status = TimeSlotStatus.AVAILABLE;
    timeSlot.appointmentId = null;
    
    return this.timeSlotRepository.save(timeSlot);
  }

  async generateTimeSlotsFromSchedule(
    availabilityScheduleId: number,
    startDate: Date,
    endDate: Date,
    slotDurationMinutes: number,
    bufferMinutes: number = 0
  ): Promise<TimeSlot[]> {
    // This method would generate time slots based on availability schedule
    // It would need to fetch the schedule, check the day of week, and create slots
    // according to the schedule's start and end times
    
    // This is a placeholder implementation
    return [];
  }

  private async findOverlappingSlots(
    startTime: Date,
    endTime: Date,
    availabilityScheduleId: number,
    excludeId?: string
  ): Promise<TimeSlot[]> {
    const query = this.timeSlotRepository.createQueryBuilder('timeSlot')
      .where('timeSlot.availabilityScheduleId = :availabilityScheduleId', { availabilityScheduleId })
      .andWhere('timeSlot.isActive = :isActive', { isActive: true })
      .andWhere(
        '(timeSlot.startTime < :endTime AND timeSlot.endTime > :startTime)',
        { startTime, endTime }
      );
    
    if (excludeId) {
      query.andWhere('timeSlot.id != :excludeId', { excludeId });
    }
    
    return query.getMany();
  }

  private checkBatchOverlaps(timeSlots: TimeSlot[]): void {
    // Group slots by availabilityScheduleId
    const slotsBySchedule: Record<number, TimeSlot[]> = {};
    
    for (const slot of timeSlots) {
      if (!slotsBySchedule[slot.availabilityScheduleId]) {
        slotsBySchedule[slot.availabilityScheduleId] = [];
      }
      slotsBySchedule[slot.availabilityScheduleId].push(slot);
    }
    
    // Check for overlaps within each schedule
    for (const scheduleId in slotsBySchedule) {
      const slots = slotsBySchedule[scheduleId];
      
      // Sort by start time
      slots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      
      // Check for overlaps
      for (let i = 0; i < slots.length - 1; i++) {
        if (slots[i].endTime > slots[i + 1].startTime) {
          throw new ConflictException(
            `Time slots ${slots[i].startTime} - ${slots[i].endTime} and ` +
            `${slots[i + 1].startTime} - ${slots[i + 1].endTime} overlap`
          );
        }
      }
    }
  }
}
