import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment';

import { SchedulePatternService } from './schedule-pattern.service';
import { TimeSlotService } from './time-slot.service';
import { ScheduleExceptionService } from './schedule-exception.service';
import { SchedulingConfigService } from './scheduling-config.service';

import { TimeSlot, TimeSlotStatus } from '../entities/time-slot.entity';
import { ScheduleException, ExceptionType } from '../entities/schedule-exception.entity';
import { AvailabilitySchedule } from '../../Veterinarian and Staff Module/entities/availability-schedule.entity';

@Injectable()
export class SchedulingService {
  constructor(
    @InjectRepository(AvailabilitySchedule)
    private availabilityScheduleRepository: Repository<AvailabilitySchedule>,
    private schedulePatternService: SchedulePatternService,
    private timeSlotService: TimeSlotService,
    private scheduleExceptionService: ScheduleExceptionService,
    private configService: SchedulingConfigService,
  ) {}

  async generateTimeSlots(
    veterinarianId: number,
    startDate: Date,
    endDate: Date
  ): Promise<TimeSlot[]> {
    // Get veterinarian's availability schedules
    const availabilitySchedules = await this.availabilityScheduleRepository.find({
      where: { veterinarianId, isActive: true }
    });

    if (!availabilitySchedules.length) {
      throw new BadRequestException('No active availability schedules found for this veterinarian');
    }

    // Get scheduling configuration
    const config = await this.configService.getEffectiveConfig(veterinarianId);
    
    // Get exceptions (breaks, holidays, etc.)
    const exceptions = await this.scheduleExceptionService.findByVeterinarianAndDateRange(
      veterinarianId,
      startDate,
      endDate
    );

    // Generate time slots for each day in the date range
    const allSlots: TimeSlot[] = [];
    const currentDate = moment(startDate).startOf('day');
    const endMoment = moment(endDate).endOf('day');

    while (currentDate.isSameOrBefore(endMoment)) {
      const dayOfWeek = currentDate.day(); // 0 = Sunday, 1 = Monday, etc.
      const dayName = this.getDayName(dayOfWeek).toLowerCase();
      
      // Find availability schedule for this day
      const schedule = availabilitySchedules.find(s => 
        s.dayOfWeek.toLowerCase() === dayName
      );

      if (schedule) {
        // Generate slots for this day based on schedule and configuration
        const daySlots = await this.generateDaySlots(
          schedule,
          currentDate.toDate(),
          config.defaultSlotDurationMinutes,
          config.bufferTimeMinutes,
          exceptions
        );
        
        allSlots.push(...daySlots);
      }

      currentDate.add(1, 'days');
    }

    // Save all generated slots
    if (allSlots.length > 0) {
      return this.timeSlotService.createBatch(allSlots.map(slot => ({
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        status: slot.status,
        availabilityScheduleId: slot.availabilityScheduleId,
        isActive: true
      })));
    }

    return [];
  }

  async checkAvailability(
    veterinarianId: number,
    startDate: Date,
    endDate: Date
  ): Promise<{ available: boolean; availableSlots: TimeSlot[] }> {
    // Get available time slots
    const slots = await this.timeSlotService.findByVeterinarianAndDateRange(
      veterinarianId,
      startDate,
      endDate
    );

    const availableSlots = slots.filter(slot => slot.status === TimeSlotStatus.AVAILABLE);

    return {
      available: availableSlots.length > 0,
      availableSlots
    };
  }

  async blockTimeSlots(
    veterinarianId: number,
    startTime: Date,
    endTime: Date,
    reason: string
  ): Promise<TimeSlot[]> {
    // Find slots in the time range
    const slots = await this.timeSlotService.findByVeterinarianAndDateRange(
      veterinarianId,
      startTime,
      endTime
    );

    const availableSlots = slots.filter(slot => slot.status === TimeSlotStatus.AVAILABLE);
    
    if (availableSlots.length === 0) {
      throw new BadRequestException('No available time slots found in the specified time range');
    }

    // Block each slot
    const blockedSlots: TimeSlot[] = [];
    for (const slot of availableSlots) {
      const blockedSlot = await this.timeSlotService.blockSlot(slot.id, reason);
      blockedSlots.push(blockedSlot);
    }

    return blockedSlots;
  }

  async addBreakTime(
    veterinarianId: number,
    startTime: Date,
    endTime: Date,
    title: string,
    description?: string,
    isRecurring: boolean = false,
    recurrenceRule?: any
  ): Promise<ScheduleException> {
    // Create break exception
    const breakException = await this.scheduleExceptionService.create({
      type: ExceptionType.BREAK,
      title,
      description,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      isRecurring,
      recurrenceRule,
      veterinarianId,
      isActive: true
    });

    // Block any existing time slots that overlap with this break
    await this.blockTimeSlots(veterinarianId, startTime, endTime, `Break: ${title}`);

    return breakException;
  }

  async addHoliday(
    veterinarianId: number,
    startTime: Date,
    endTime: Date,
    title: string,
    description?: string,
    isRecurring: boolean = false,
    recurrenceRule?: any
  ): Promise<ScheduleException> {
    // Create holiday exception
    const holidayException = await this.scheduleExceptionService.create({
      type: ExceptionType.HOLIDAY,
      title,
      description,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      isRecurring,
      recurrenceRule,
      veterinarianId,
      isActive: true
    });

    // Block any existing time slots that overlap with this holiday
    await this.blockTimeSlots(veterinarianId, startTime, endTime, `Holiday: ${title}`);

    return holidayException;
  }

  async resolveConflicts(
    veterinarianId: number,
    startDate: Date,
    endDate: Date
  ): Promise<{ resolved: number; errors: string[] }> {
    // Get all slots in the date range
    const slots = await this.timeSlotService.findByVeterinarianAndDateRange(
      veterinarianId,
      startDate,
      endDate
    );

    // Get all exceptions in the date range
    const exceptions = await this.scheduleExceptionService.findByVeterinarianAndDateRange(
      veterinarianId,
      startDate,
      endDate
    );

    const resolved: number = 0;
    const errors: string[] = [];

    // Process each exception
    for (const exception of exceptions) {
      // Find slots that overlap with this exception
      const overlappingSlots = slots.filter(slot => 
        slot.startTime < exception.endTime && slot.endTime > exception.startTime
      );

      // Handle each overlapping slot based on exception type
      for (const slot of overlappingSlots) {
        try {
          if (slot.status === TimeSlotStatus.AVAILABLE) {
            switch (exception.type) {
              case ExceptionType.BREAK:
                await this.timeSlotService.markAsBreak(slot.id);
                break;
              case ExceptionType.HOLIDAY:
                await this.timeSlotService.markAsHoliday(slot.id);
                break;
              default:
                await this.timeSlotService.blockSlot(slot.id, `Exception: ${exception.title}`);
                break;
            }
          }
        } catch (error) {
          errors.push(`Failed to resolve conflict for slot ${slot.id}: ${error.message}`);
        }
      }
    }

    return { resolved, errors };
  }

  private async generateDaySlots(
    schedule: AvailabilitySchedule,
    date: Date,
    slotDurationMinutes: number,
    bufferMinutes: number,
    exceptions: ScheduleException[]
  ): Promise<TimeSlot[]> {
    const slots: TimeSlot[] = [];
    
    // Parse schedule times
    const scheduleStartTime = moment(date).set({
      hour: parseInt(schedule.startTime.split(':')[0]),
      minute: parseInt(schedule.startTime.split(':')[1]),
      second: 0,
      millisecond: 0
    });
    
    const scheduleEndTime = moment(date).set({
      hour: parseInt(schedule.endTime.split(':')[0]),
      minute: parseInt(schedule.endTime.split(':')[1]),
      second: 0,
      millisecond: 0
    });
    
    // Generate slots
    let slotStart = scheduleStartTime.clone();
    
    while (slotStart.add(slotDurationMinutes, 'minutes').isSameOrBefore(scheduleEndTime)) {
      const slotEnd = slotStart.clone().add(slotDurationMinutes, 'minutes');
      
      // Check if this slot overlaps with any exception
      const isExceptionOverlap = exceptions.some(exception => 
        slotStart.toDate() < exception.endTime && slotEnd.toDate() > exception.startTime
      );
      
      // Create slot with appropriate status
      const slot: Partial<TimeSlot> = {
        startTime: slotStart.toDate(),
        endTime: slotEnd.toDate(),
        status: isExceptionOverlap ? TimeSlotStatus.BLOCKED : TimeSlotStatus.AVAILABLE,
        availabilityScheduleId: schedule.id,
        isActive: true
      };
      
      slots.push(slot as TimeSlot);
      
      // Move to next slot start time (including buffer)
      slotStart.add(bufferMinutes, 'minutes');
    }
    
    return slots;
  }

  private getDayName(dayIndex: number): string {
    const days = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY'
    ];
    return days[dayIndex];
  }
}
