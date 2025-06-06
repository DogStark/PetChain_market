import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ScheduleException, ExceptionType } from '../entities/schedule-exception.entity';
import { CreateScheduleExceptionDto } from '../dto/create-schedule-exception.dto';
import { UpdateScheduleExceptionDto } from '../dto/update-schedule-exception.dto';
import * as moment from 'moment';

@Injectable()
export class ScheduleExceptionService {
  constructor(
    @InjectRepository(ScheduleException)
    private exceptionRepository: Repository<ScheduleException>,
  ) {}

  async create(createExceptionDto: CreateScheduleExceptionDto): Promise<ScheduleException> {
    // Validate time range
    const startTime = new Date(createExceptionDto.startTime);
    const endTime = new Date(createExceptionDto.endTime);
    
    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Check for overlapping exceptions of the same type
    const existingExceptions = await this.findOverlappingExceptions(
      startTime,
      endTime,
      createExceptionDto.veterinarianId,
      createExceptionDto.type
    );

    if (existingExceptions.length > 0) {
      throw new ConflictException('Exception overlaps with existing exceptions of the same type');
    }

    // Create exception
    const exception = this.exceptionRepository.create({
      ...createExceptionDto,
      startTime,
      endTime,
      recurrenceRule: createExceptionDto.isRecurring ? createExceptionDto.recurrenceRule : null,
    });

    return this.exceptionRepository.save(exception);
  }

  async findAll(): Promise<ScheduleException[]> {
    return this.exceptionRepository.find({
      where: { isActive: true },
      relations: ['veterinarian'],
      order: { startTime: 'ASC' }
    });
  }

  async findOne(id: string): Promise<ScheduleException> {
    const exception = await this.exceptionRepository.findOne({
      where: { id },
      relations: ['veterinarian']
    });
    
    if (!exception) {
      throw new NotFoundException(`Schedule exception with ID ${id} not found`);
    }
    
    return exception;
  }

  async findByVeterinarian(veterinarianId: number): Promise<ScheduleException[]> {
    return this.exceptionRepository.find({
      where: { veterinarianId, isActive: true },
      order: { startTime: 'ASC' }
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<ScheduleException[]> {
    return this.exceptionRepository.find({
      where: {
        startTime: LessThanOrEqual(endDate),
        endTime: MoreThanOrEqual(startDate),
        isActive: true
      },
      relations: ['veterinarian'],
      order: { startTime: 'ASC' }
    });
  }

  async findByVeterinarianAndDateRange(
    veterinarianId: number, 
    startDate: Date, 
    endDate: Date
  ): Promise<ScheduleException[]> {
    return this.exceptionRepository.find({
      where: {
        veterinarianId,
        startTime: LessThanOrEqual(endDate),
        endTime: MoreThanOrEqual(startDate),
        isActive: true
      },
      order: { startTime: 'ASC' }
    });
  }

  async findByType(type: ExceptionType): Promise<ScheduleException[]> {
    return this.exceptionRepository.find({
      where: { type, isActive: true },
      relations: ['veterinarian'],
      order: { startTime: 'ASC' }
    });
  }

  async update(id: string, updateExceptionDto: UpdateScheduleExceptionDto): Promise<ScheduleException> {
    const exception = await this.findOne(id);
    
    // Handle time changes
    let startTime = exception.startTime;
    let endTime = exception.endTime;
    
    if (updateExceptionDto.startTime) {
      startTime = new Date(updateExceptionDto.startTime);
    }
    
    if (updateExceptionDto.endTime) {
      endTime = new Date(updateExceptionDto.endTime);
    }
    
    // Validate time range
    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }
    
    // Check for overlapping exceptions if times or type changed
    if (updateExceptionDto.startTime || updateExceptionDto.endTime || updateExceptionDto.type) {
      const type = updateExceptionDto.type || exception.type;
      const existingExceptions = await this.findOverlappingExceptions(
        startTime,
        endTime,
        exception.veterinarianId,
        type,
        id
      );
      
      if (existingExceptions.length > 0) {
        throw new ConflictException('Updated exception would overlap with existing exceptions of the same type');
      }
    }
    
    // Update exception
    Object.assign(exception, {
      ...updateExceptionDto,
      startTime,
      endTime,
      recurrenceRule: updateExceptionDto.isRecurring !== undefined 
        ? (updateExceptionDto.isRecurring ? updateExceptionDto.recurrenceRule || exception.recurrenceRule : null)
        : exception.recurrenceRule
    });
    
    return this.exceptionRepository.save(exception);
  }

  async remove(id: string): Promise<void> {
    const result = await this.exceptionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Schedule exception with ID ${id} not found`);
    }
  }

  async deactivate(id: string): Promise<ScheduleException> {
    const exception = await this.findOne(id);
    exception.isActive = false;
    return this.exceptionRepository.save(exception);
  }

  async getHolidays(year: number): Promise<ScheduleException[]> {
    const startDate = new Date(year, 0, 1); // January 1st
    const endDate = new Date(year, 11, 31); // December 31st
    
    return this.exceptionRepository.find({
      where: {
        type: ExceptionType.HOLIDAY,
        startTime: Between(startDate, endDate),
        isActive: true
      },
      order: { startTime: 'ASC' }
    });
  }

  async getBreakTimes(veterinarianId: number, date: Date): Promise<ScheduleException[]> {
    const startOfDay = moment(date).startOf('day').toDate();
    const endOfDay = moment(date).endOf('day').toDate();
    
    return this.exceptionRepository.find({
      where: {
        veterinarianId,
        type: ExceptionType.BREAK,
        startTime: LessThanOrEqual(endOfDay),
        endTime: MoreThanOrEqual(startOfDay),
        isActive: true
      },
      order: { startTime: 'ASC' }
    });
  }

  async getRecurringExceptionOccurrences(
    exceptionId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<Date[]> {
    const exception = await this.findOne(exceptionId);
    
    if (!exception.isRecurring || !exception.recurrenceRule) {
      return [exception.startTime];
    }
    
    // This would implement complex recurrence rule processing
    // For now, we'll return a placeholder implementation
    return [exception.startTime];
  }

  private async findOverlappingExceptions(
    startTime: Date,
    endTime: Date,
    veterinarianId: number,
    type: ExceptionType,
    excludeId?: string
  ): Promise<ScheduleException[]> {
    const query = this.exceptionRepository.createQueryBuilder('exception')
      .where('exception.veterinarianId = :veterinarianId', { veterinarianId })
      .andWhere('exception.type = :type', { type })
      .andWhere('exception.isActive = :isActive', { isActive: true })
      .andWhere(
        '(exception.startTime < :endTime AND exception.endTime > :startTime)',
        { startTime, endTime }
      );
    
    if (excludeId) {
      query.andWhere('exception.id != :excludeId', { excludeId });
    }
    
    return query.getMany();
  }
}
