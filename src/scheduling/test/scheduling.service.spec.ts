import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment';

import { SchedulingService } from '../services/scheduling.service';
import { TimeSlotService } from '../services/time-slot.service';
import { SchedulePatternService } from '../services/schedule-pattern.service';
import { ScheduleExceptionService } from '../services/schedule-exception.service';
import { SchedulingConfigService } from '../services/scheduling-config.service';

import { TimeSlot } from '../entities/time-slot.entity';
import { SchedulePattern } from '../entities/schedule-pattern.entity';
import { ScheduleException } from '../entities/schedule-exception.entity';
import { SchedulingConfig } from '../entities/scheduling-config.entity';
import { AvailabilitySchedule } from '../../Veterinarian and Staff Module/entities/availability-schedule.entity';

describe('SchedulingService', () => {
  let schedulingService: SchedulingService;
  let timeSlotService: TimeSlotService;
  let schedulePatternService: SchedulePatternService;
  let scheduleExceptionService: ScheduleExceptionService;
  let schedulingConfigService: SchedulingConfigService;
  
  // Mock repositories
  let timeSlotRepository: Repository<TimeSlot>;
  let schedulePatternRepository: Repository<SchedulePattern>;
  let scheduleExceptionRepository: Repository<ScheduleException>;
  let schedulingConfigRepository: Repository<SchedulingConfig>;
  let availabilityScheduleRepository: Repository<AvailabilitySchedule>;
  
  const mockTimeSlotRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  
  const mockSchedulePatternRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  
  const mockScheduleExceptionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  
  const mockSchedulingConfigRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  
  const mockAvailabilityScheduleRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulingService,
        TimeSlotService,
        SchedulePatternService,
        ScheduleExceptionService,
        SchedulingConfigService,
        {
          provide: getRepositoryToken(TimeSlot),
          useValue: mockTimeSlotRepository,
        },
        {
          provide: getRepositoryToken(SchedulePattern),
          useValue: mockSchedulePatternRepository,
        },
        {
          provide: getRepositoryToken(ScheduleException),
          useValue: mockScheduleExceptionRepository,
        },
        {
          provide: getRepositoryToken(SchedulingConfig),
          useValue: mockSchedulingConfigRepository,
        },
        {
          provide: getRepositoryToken(AvailabilitySchedule),
          useValue: mockAvailabilityScheduleRepository,
        },
      ],
    }).compile();

    schedulingService = module.get<SchedulingService>(SchedulingService);
    timeSlotService = module.get<TimeSlotService>(TimeSlotService);
    schedulePatternService = module.get<SchedulePatternService>(SchedulePatternService);
    scheduleExceptionService = module.get<ScheduleExceptionService>(ScheduleExceptionService);
    schedulingConfigService = module.get<SchedulingConfigService>(SchedulingConfigService);
    
    timeSlotRepository = module.get<Repository<TimeSlot>>(getRepositoryToken(TimeSlot));
    schedulePatternRepository = module.get<Repository<SchedulePattern>>(getRepositoryToken(SchedulePattern));
    scheduleExceptionRepository = module.get<Repository<ScheduleException>>(getRepositoryToken(ScheduleException));
    schedulingConfigRepository = module.get<Repository<SchedulingConfig>>(getRepositoryToken(SchedulingConfig));
    availabilityScheduleRepository = module.get<Repository<AvailabilitySchedule>>(getRepositoryToken(AvailabilitySchedule));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(schedulingService).toBeDefined();
  });

  describe('generateTimeSlots', () => {
    it('should generate time slots for a veterinarian', async () => {
      // Mock data
      const veterinarianId = 1;
      const startDate = new Date('2025-06-04T00:00:00Z');
      const endDate = new Date('2025-06-10T23:59:59Z');
      
      const mockAvailabilitySchedules = [
        {
          id: '1',
          veterinarianId: 1,
          isActive: true,
        },
      ];
      
      const mockPatterns = [
        {
          id: '1',
          availabilityScheduleId: 1,
          recurrenceType: 'WEEKLY',
          recurrenceRule: {
            daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
            interval: 1,
          },
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31'),
          isActive: true,
        },
      ];
      
      const mockConfig = {
        id: '1',
        veterinarianId: 1,
        slotDurationMinutes: 30,
        bufferTimeMinutes: 5,
        dailySchedule: {
          monday: {
            workingHours: [{ startTime: '09:00', endTime: '17:00' }],
            breakTimes: [{ startTime: '12:00', endTime: '13:00' }],
          },
          tuesday: {
            workingHours: [{ startTime: '09:00', endTime: '17:00' }],
            breakTimes: [{ startTime: '12:00', endTime: '13:00' }],
          },
          wednesday: {
            workingHours: [{ startTime: '09:00', endTime: '17:00' }],
            breakTimes: [{ startTime: '12:00', endTime: '13:00' }],
          },
          thursday: {
            workingHours: [{ startTime: '09:00', endTime: '17:00' }],
            breakTimes: [{ startTime: '12:00', endTime: '13:00' }],
          },
          friday: {
            workingHours: [{ startTime: '09:00', endTime: '17:00' }],
            breakTimes: [{ startTime: '12:00', endTime: '13:00' }],
          },
          saturday: { workingHours: [], breakTimes: [] },
          sunday: { workingHours: [], breakTimes: [] },
        },
        isActive: true,
      };
      
      const mockExceptions = [
        {
          id: '1',
          veterinarianId: 1,
          startTime: new Date('2025-06-05T00:00:00Z'),
          endTime: new Date('2025-06-05T23:59:59Z'),
          type: 'HOLIDAY',
          title: 'Holiday',
          isActive: true,
        },
      ];
      
      const mockTimeSlots = [
        {
          id: '1',
          veterinarianId: 1,
          startTime: new Date('2025-06-04T09:00:00Z'),
          endTime: new Date('2025-06-04T09:30:00Z'),
          status: 'AVAILABLE',
          isActive: true,
        },
        // More time slots would be here in a real implementation
      ];
      
      // Mock service method calls
      jest.spyOn(availabilityScheduleRepository, 'find').mockResolvedValue(mockAvailabilitySchedules);
      jest.spyOn(schedulePatternService, 'findByAvailabilitySchedule').mockResolvedValue(mockPatterns);
      jest.spyOn(schedulingConfigService, 'getEffectiveConfig').mockResolvedValue(mockConfig);
      jest.spyOn(scheduleExceptionService, 'findByVeterinarianAndDateRange').mockResolvedValue(mockExceptions);
      jest.spyOn(schedulePatternService, 'generateOccurrences').mockResolvedValue([
        new Date('2025-06-04'),
        new Date('2025-06-06'),
        new Date('2025-06-09'),
      ]);
      jest.spyOn(timeSlotService, 'createBatch').mockResolvedValue(mockTimeSlots);
      
      // Execute the method
      const result = await schedulingService.generateTimeSlots(veterinarianId, startDate, endDate);
      
      // Assertions
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(availabilityScheduleRepository.find).toHaveBeenCalled();
      expect(schedulePatternService.findByAvailabilitySchedule).toHaveBeenCalled();
      expect(schedulingConfigService.getEffectiveConfig).toHaveBeenCalled();
      expect(scheduleExceptionService.findByVeterinarianAndDateRange).toHaveBeenCalled();
      expect(timeSlotService.createBatch).toHaveBeenCalled();
    });
  });

  describe('checkAvailability', () => {
    it('should check availability for a veterinarian', async () => {
      // Mock data
      const veterinarianId = 1;
      const startDate = new Date('2025-06-04T10:00:00Z');
      const endDate = new Date('2025-06-04T11:00:00Z');
      
      const mockTimeSlots = [
        {
          id: '1',
          veterinarianId: 1,
          startTime: new Date('2025-06-04T10:00:00Z'),
          endTime: new Date('2025-06-04T10:30:00Z'),
          status: 'AVAILABLE',
          isActive: true,
        },
        {
          id: '2',
          veterinarianId: 1,
          startTime: new Date('2025-06-04T10:30:00Z'),
          endTime: new Date('2025-06-04T11:00:00Z'),
          status: 'AVAILABLE',
          isActive: true,
        },
      ];
      
      // Mock service method calls
      jest.spyOn(timeSlotService, 'findAvailableByDateRangeAndVeterinarian').mockResolvedValue(mockTimeSlots);
      
      // Execute the method
      const result = await schedulingService.checkAvailability(veterinarianId, startDate, endDate);
      
      // Assertions
      expect(result).toBeDefined();
      expect(result.available).toBe(true);
      expect(result.availableSlots).toEqual(mockTimeSlots);
      expect(timeSlotService.findAvailableByDateRangeAndVeterinarian).toHaveBeenCalledWith(
        veterinarianId,
        startDate,
        endDate
      );
    });
    
    it('should return not available when no slots are found', async () => {
      // Mock data
      const veterinarianId = 1;
      const startDate = new Date('2025-06-04T10:00:00Z');
      const endDate = new Date('2025-06-04T11:00:00Z');
      
      // Mock service method calls
      jest.spyOn(timeSlotService, 'findAvailableByDateRangeAndVeterinarian').mockResolvedValue([]);
      
      // Execute the method
      const result = await schedulingService.checkAvailability(veterinarianId, startDate, endDate);
      
      // Assertions
      expect(result).toBeDefined();
      expect(result.available).toBe(false);
      expect(result.availableSlots).toEqual([]);
    });
  });

  describe('blockTimeSlots', () => {
    it('should block time slots for a veterinarian', async () => {
      // Mock data
      const veterinarianId = 1;
      const startTime = new Date('2025-06-04T14:00:00Z');
      const endTime = new Date('2025-06-04T16:00:00Z');
      const reason = 'Staff meeting';
      
      const mockTimeSlots = [
        {
          id: '1',
          veterinarianId: 1,
          startTime: new Date('2025-06-04T14:00:00Z'),
          endTime: new Date('2025-06-04T14:30:00Z'),
          status: 'AVAILABLE',
          isActive: true,
        },
        {
          id: '2',
          veterinarianId: 1,
          startTime: new Date('2025-06-04T14:30:00Z'),
          endTime: new Date('2025-06-04T15:00:00Z'),
          status: 'AVAILABLE',
          isActive: true,
        },
        {
          id: '3',
          veterinarianId: 1,
          startTime: new Date('2025-06-04T15:00:00Z'),
          endTime: new Date('2025-06-04T15:30:00Z'),
          status: 'AVAILABLE',
          isActive: true,
        },
        {
          id: '4',
          veterinarianId: 1,
          startTime: new Date('2025-06-04T15:30:00Z'),
          endTime: new Date('2025-06-04T16:00:00Z'),
          status: 'AVAILABLE',
          isActive: true,
        },
      ];
      
      const blockedSlots = mockTimeSlots.map(slot => ({
        ...slot,
        status: 'BLOCKED',
        notes: reason,
      }));
      
      // Mock service method calls
      jest.spyOn(timeSlotService, 'findByDateRangeAndVeterinarian').mockResolvedValue(mockTimeSlots);
      jest.spyOn(timeSlotService, 'block').mockImplementation((id) => {
        const slot = mockTimeSlots.find(s => s.id === id);
        return Promise.resolve({
          ...slot,
          status: 'BLOCKED',
          notes: reason,
        });
      });
      
      // Execute the method
      const result = await schedulingService.blockTimeSlots(veterinarianId, startTime, endTime, reason);
      
      // Assertions
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(mockTimeSlots.length);
      expect(timeSlotService.findByDateRangeAndVeterinarian).toHaveBeenCalledWith(
        veterinarianId,
        startTime,
        endTime
      );
      expect(timeSlotService.block).toHaveBeenCalledTimes(mockTimeSlots.length);
    });
  });
});
