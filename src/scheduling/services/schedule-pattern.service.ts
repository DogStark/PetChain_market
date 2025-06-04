import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchedulePattern, RecurrenceType } from '../entities/schedule-pattern.entity';
import { CreateSchedulePatternDto } from '../dto/create-schedule-pattern.dto';
import { UpdateSchedulePatternDto } from '../dto/update-schedule-pattern.dto';
import * as moment from 'moment';

@Injectable()
export class SchedulePatternService {
  constructor(
    @InjectRepository(SchedulePattern)
    private patternRepository: Repository<SchedulePattern>,
  ) {}

  async create(createPatternDto: CreateSchedulePatternDto): Promise<SchedulePattern> {
    // Validate dates
    if (createPatternDto.endDate && new Date(createPatternDto.startDate) > new Date(createPatternDto.endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Create pattern
    const pattern = this.patternRepository.create({
      ...createPatternDto,
      startDate: new Date(createPatternDto.startDate),
      endDate: createPatternDto.endDate ? new Date(createPatternDto.endDate) : null,
    });

    return this.patternRepository.save(pattern);
  }

  async findAll(): Promise<SchedulePattern[]> {
    return this.patternRepository.find({ 
      where: { isActive: true },
      relations: ['availabilitySchedule'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<SchedulePattern> {
    const pattern = await this.patternRepository.findOne({ 
      where: { id },
      relations: ['availabilitySchedule']
    });
    
    if (!pattern) {
      throw new NotFoundException(`Schedule pattern with ID ${id} not found`);
    }
    
    return pattern;
  }

  async findByAvailabilitySchedule(availabilityScheduleId: number): Promise<SchedulePattern[]> {
    return this.patternRepository.find({
      where: { availabilityScheduleId, isActive: true },
      order: { startDate: 'ASC' }
    });
  }

  async update(id: string, updatePatternDto: UpdateSchedulePatternDto): Promise<SchedulePattern> {
    const pattern = await this.findOne(id);
    
    // Validate dates if both are provided
    if (updatePatternDto.startDate && updatePatternDto.endDate) {
      if (new Date(updatePatternDto.startDate) > new Date(updatePatternDto.endDate)) {
        throw new BadRequestException('Start date must be before end date');
      }
    }
    
    // Update pattern
    Object.assign(pattern, {
      ...updatePatternDto,
      startDate: updatePatternDto.startDate ? new Date(updatePatternDto.startDate) : pattern.startDate,
      endDate: updatePatternDto.endDate ? new Date(updatePatternDto.endDate) : pattern.endDate,
    });
    
    return this.patternRepository.save(pattern);
  }

  async remove(id: string): Promise<void> {
    const result = await this.patternRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Schedule pattern with ID ${id} not found`);
    }
  }

  async deactivate(id: string): Promise<SchedulePattern> {
    const pattern = await this.findOne(id);
    pattern.isActive = false;
    return this.patternRepository.save(pattern);
  }

  async getOccurrenceDates(patternId: string, startDate: Date, endDate: Date): Promise<Date[]> {
    const pattern = await this.findOne(patternId);
    const occurrences: Date[] = [];
    
    // If pattern is not active or end date is before pattern start date, return empty array
    if (!pattern.isActive || endDate < pattern.startDate) {
      return occurrences;
    }
    
    // Adjust start date to be the later of the requested start date and pattern start date
    const effectiveStartDate = startDate > pattern.startDate ? startDate : pattern.startDate;
    
    // Adjust end date to be the earlier of the requested end date and pattern end date (if it exists)
    const effectiveEndDate = pattern.endDate && pattern.endDate < endDate ? pattern.endDate : endDate;
    
    // Generate occurrences based on recurrence type
    switch (pattern.recurrenceType) {
      case RecurrenceType.DAILY:
        this.generateDailyOccurrences(pattern, effectiveStartDate, effectiveEndDate, occurrences);
        break;
      case RecurrenceType.WEEKLY:
        this.generateWeeklyOccurrences(pattern, effectiveStartDate, effectiveEndDate, occurrences);
        break;
      case RecurrenceType.BIWEEKLY:
        this.generateBiweeklyOccurrences(pattern, effectiveStartDate, effectiveEndDate, occurrences);
        break;
      case RecurrenceType.MONTHLY:
        this.generateMonthlyOccurrences(pattern, effectiveStartDate, effectiveEndDate, occurrences);
        break;
      case RecurrenceType.CUSTOM:
        this.generateCustomOccurrences(pattern, effectiveStartDate, effectiveEndDate, occurrences);
        break;
    }
    
    // Limit by occurrences if specified
    if (pattern.occurrences > 0 && occurrences.length > pattern.occurrences) {
      return occurrences.slice(0, pattern.occurrences);
    }
    
    return occurrences;
  }

  private generateDailyOccurrences(
    pattern: SchedulePattern, 
    startDate: Date, 
    endDate: Date, 
    occurrences: Date[]
  ): void {
    const interval = pattern.recurrenceRule?.interval || 1;
    let currentDate = moment(startDate).startOf('day');
    const endMoment = moment(endDate).endOf('day');
    
    while (currentDate.isSameOrBefore(endMoment)) {
      occurrences.push(currentDate.toDate());
      currentDate = currentDate.add(interval, 'days');
    }
  }

  private generateWeeklyOccurrences(
    pattern: SchedulePattern, 
    startDate: Date, 
    endDate: Date, 
    occurrences: Date[]
  ): void {
    const daysOfWeek = pattern.recurrenceRule?.daysOfWeek || [0, 1, 2, 3, 4, 5, 6];
    let currentDate = moment(startDate).startOf('day');
    const endMoment = moment(endDate).endOf('day');
    
    while (currentDate.isSameOrBefore(endMoment)) {
      const dayOfWeek = currentDate.day();
      if (daysOfWeek.includes(dayOfWeek)) {
        occurrences.push(currentDate.toDate());
      }
      currentDate = currentDate.add(1, 'days');
    }
  }

  private generateBiweeklyOccurrences(
    pattern: SchedulePattern, 
    startDate: Date, 
    endDate: Date, 
    occurrences: Date[]
  ): void {
    const daysOfWeek = pattern.recurrenceRule?.daysOfWeek || [0, 1, 2, 3, 4, 5, 6];
    let currentDate = moment(startDate).startOf('day');
    const endMoment = moment(endDate).endOf('day');
    const patternStartWeek = moment(pattern.startDate).week();
    
    while (currentDate.isSameOrBefore(endMoment)) {
      const dayOfWeek = currentDate.day();
      const weekDiff = currentDate.week() - patternStartWeek;
      
      if (daysOfWeek.includes(dayOfWeek) && weekDiff % 2 === 0) {
        occurrences.push(currentDate.toDate());
      }
      currentDate = currentDate.add(1, 'days');
    }
  }

  private generateMonthlyOccurrences(
    pattern: SchedulePattern, 
    startDate: Date, 
    endDate: Date, 
    occurrences: Date[]
  ): void {
    const daysOfMonth = pattern.recurrenceRule?.daysOfMonth || [1];
    const interval = pattern.recurrenceRule?.interval || 1;
    let currentDate = moment(startDate).startOf('month');
    const endMoment = moment(endDate).endOf('month');
    
    while (currentDate.isSameOrBefore(endMoment)) {
      const monthDiff = (currentDate.year() - moment(pattern.startDate).year()) * 12 + 
                        (currentDate.month() - moment(pattern.startDate).month());
                        
      if (monthDiff % interval === 0) {
        for (const day of daysOfMonth) {
          const specificDate = moment(currentDate).date(day);
          if (specificDate.isValid() && 
              specificDate.isSameOrAfter(moment(startDate)) && 
              specificDate.isSameOrBefore(endMoment)) {
            occurrences.push(specificDate.toDate());
          }
        }
      }
      currentDate = currentDate.add(1, 'month');
    }
  }

  private generateCustomOccurrences(
    pattern: SchedulePattern, 
    startDate: Date, 
    endDate: Date, 
    occurrences: Date[]
  ): void {
    // Custom recurrence handling based on complex rules
    // This is a placeholder for custom implementation
    // Could involve complex logic based on pattern.recurrenceRule
  }
}
