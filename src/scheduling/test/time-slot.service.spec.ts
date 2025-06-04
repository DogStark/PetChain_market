import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

import { TimeSlotService } from '../services/time-slot.service';
import { TimeSlot } from '../entities/time-slot.entity';
import { CreateTimeSlotDto } from '../dto/create-time-slot.dto';
import { UpdateTimeSlotDto } from '../dto/update-time-slot.dto';

describe('TimeSlotService', () => {
  let service: TimeSlotService;
  let repository: Repository<TimeSlot>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeSlotService,
        {
          provide: getRepositoryToken(TimeSlot),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TimeSlotService>(TimeSlotService);
    repository = module.get<Repository<TimeSlot>>(getRepositoryToken(TimeSlot));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a time slot', async () => {
      const dto: CreateTimeSlotDto = {
        startTime: new Date('2025-06-04T09:00:00Z'),
        endTime: new Date('2025-06-04T09:30:00Z'),
        veterinarianId: 1,
        status: 'AVAILABLE',
        isActive: true,
      };

      const timeSlot = {
        id: '1',
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(timeSlot);
      mockRepository.save.mockResolvedValue(timeSlot);
      mockRepository.findOne.mockResolvedValue(null); // No overlapping slots

      const result = await service.create(dto);

      expect(result).toEqual(timeSlot);
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(timeSlot);
    });

    it('should throw ConflictException if time slot overlaps with existing slots', async () => {
      const dto: CreateTimeSlotDto = {
        startTime: new Date('2025-06-04T09:00:00Z'),
        endTime: new Date('2025-06-04T09:30:00Z'),
        veterinarianId: 1,
        status: 'AVAILABLE',
        isActive: true,
      };

      const existingSlot = {
        id: '1',
        startTime: new Date('2025-06-04T09:15:00Z'),
        endTime: new Date('2025-06-04T09:45:00Z'),
        veterinarianId: 1,
        status: 'AVAILABLE',
        isActive: true,
      };

      mockRepository.createQueryBuilder().getMany.mockResolvedValue([existingSlot]);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return an array of time slots', async () => {
      const timeSlots = [
        {
          id: '1',
          startTime: new Date('2025-06-04T09:00:00Z'),
          endTime: new Date('2025-06-04T09:30:00Z'),
          veterinarianId: 1,
          status: 'AVAILABLE',
          isActive: true,
        },
        {
          id: '2',
          startTime: new Date('2025-06-04T09:30:00Z'),
          endTime: new Date('2025-06-04T10:00:00Z'),
          veterinarianId: 1,
          status: 'AVAILABLE',
          isActive: true,
        },
      ];

      mockRepository.find.mockResolvedValue(timeSlots);

      const result = await service.findAll();

      expect(result).toEqual(timeSlots);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a time slot by id', async () => {
      const timeSlot = {
        id: '1',
        startTime: new Date('2025-06-04T09:00:00Z'),
        endTime: new Date('2025-06-04T09:30:00Z'),
        veterinarianId: 1,
        status: 'AVAILABLE',
        isActive: true,
      };

      mockRepository.findOne.mockResolvedValue(timeSlot);

      const result = await service.findOne('1');

      expect(result).toEqual(timeSlot);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException if time slot not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a time slot', async () => {
      const id = '1';
      const dto: UpdateTimeSlotDto = {
        status: 'BLOCKED',
        notes: 'Blocked for maintenance',
      };

      const timeSlot = {
        id,
        startTime: new Date('2025-06-04T09:00:00Z'),
        endTime: new Date('2025-06-04T09:30:00Z'),
        veterinarianId: 1,
        status: 'AVAILABLE',
        isActive: true,
      };

      const updatedSlot = {
        ...timeSlot,
        ...dto,
      };

      mockRepository.findOne.mockResolvedValue(timeSlot);
      mockRepository.save.mockResolvedValue(updatedSlot);

      const result = await service.update(id, dto);

      expect(result).toEqual(updatedSlot);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining(dto));
    });

    it('should throw NotFoundException if time slot not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a time slot', async () => {
      const id = '1';
      const timeSlot = {
        id,
        startTime: new Date('2025-06-04T09:00:00Z'),
        endTime: new Date('2025-06-04T09:30:00Z'),
        veterinarianId: 1,
        status: 'AVAILABLE',
        isActive: true,
      };

      mockRepository.findOne.mockResolvedValue(timeSlot);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if time slot not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('book', () => {
    it('should book a time slot', async () => {
      const id = '1';
      const clientId = 100;
      const petId = 200;
      const appointmentId = '300';
      const notes = 'Regular checkup';

      const timeSlot = {
        id,
        startTime: new Date('2025-06-04T09:00:00Z'),
        endTime: new Date('2025-06-04T09:30:00Z'),
        veterinarianId: 1,
        status: 'AVAILABLE',
        isActive: true,
      };

      const bookedSlot = {
        ...timeSlot,
        status: 'BOOKED',
        clientId,
        petId,
        appointmentId,
        notes,
      };

      mockRepository.findOne.mockResolvedValue(timeSlot);
      mockRepository.save.mockResolvedValue(bookedSlot);

      const result = await service.book(id, clientId, petId, appointmentId, notes);

      expect(result).toEqual(bookedSlot);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        status: 'BOOKED',
        clientId,
        petId,
        appointmentId,
        notes,
      }));
    });

    it('should throw BadRequestException if time slot is not available', async () => {
      const timeSlot = {
        id: '1',
        startTime: new Date('2025-06-04T09:00:00Z'),
        endTime: new Date('2025-06-04T09:30:00Z'),
        veterinarianId: 1,
        status: 'BOOKED',
        isActive: true,
      };

      mockRepository.findOne.mockResolvedValue(timeSlot);

      await expect(service.book('1', 100, 200)).rejects.toThrow(BadRequestException);
    });
  });

  describe('block', () => {
    it('should block a time slot', async () => {
      const id = '1';
      const reason = 'Staff meeting';

      const timeSlot = {
        id,
        startTime: new Date('2025-06-04T09:00:00Z'),
        endTime: new Date('2025-06-04T09:30:00Z'),
        veterinarianId: 1,
        status: 'AVAILABLE',
        isActive: true,
      };

      const blockedSlot = {
        ...timeSlot,
        status: 'BLOCKED',
        notes: reason,
      };

      mockRepository.findOne.mockResolvedValue(timeSlot);
      mockRepository.save.mockResolvedValue(blockedSlot);

      const result = await service.block(id, reason);

      expect(result).toEqual(blockedSlot);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        status: 'BLOCKED',
        notes: reason,
      }));
    });

    it('should throw BadRequestException if time slot is already booked', async () => {
      const timeSlot = {
        id: '1',
        startTime: new Date('2025-06-04T09:00:00Z'),
        endTime: new Date('2025-06-04T09:30:00Z'),
        veterinarianId: 1,
        status: 'BOOKED',
        isActive: true,
      };

      mockRepository.findOne.mockResolvedValue(timeSlot);

      await expect(service.block('1', 'reason')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByDateRangeAndVeterinarian', () => {
    it('should return time slots for a veterinarian in a date range', async () => {
      const veterinarianId = 1;
      const startDate = new Date('2025-06-04T00:00:00Z');
      const endDate = new Date('2025-06-04T23:59:59Z');

      const timeSlots = [
        {
          id: '1',
          startTime: new Date('2025-06-04T09:00:00Z'),
          endTime: new Date('2025-06-04T09:30:00Z'),
          veterinarianId,
          status: 'AVAILABLE',
          isActive: true,
        },
        {
          id: '2',
          startTime: new Date('2025-06-04T09:30:00Z'),
          endTime: new Date('2025-06-04T10:00:00Z'),
          veterinarianId,
          status: 'AVAILABLE',
          isActive: true,
        },
      ];

      mockRepository.createQueryBuilder().getMany.mockResolvedValue(timeSlots);

      const result = await service.findByDateRangeAndVeterinarian(veterinarianId, startDate, endDate);

      expect(result).toEqual(timeSlots);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });
});
