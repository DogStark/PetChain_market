import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as moment from 'moment';

import { SchedulingService } from '../services/scheduling.service';
import { TimeSlotService } from '../services/time-slot.service';
import { SchedulePatternService } from '../services/schedule-pattern.service';
import { ScheduleExceptionService } from '../services/schedule-exception.service';
import { SchedulingConfigService } from '../services/scheduling-config.service';

import { CreateSchedulingConfigDto } from '../dto/create-scheduling-config.dto';
import { CreateSchedulePatternDto } from '../dto/create-schedule-pattern.dto';
import { CreateTimeSlotDto } from '../dto/create-time-slot.dto';
import { CreateScheduleExceptionDto } from '../dto/create-schedule-exception.dto';

describe('Scheduling Integration Tests', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let schedulingService: SchedulingService;
  let timeSlotService: TimeSlotService;
  let schedulePatternService: SchedulePatternService;
  let scheduleExceptionService: ScheduleExceptionService;
  let schedulingConfigService: SchedulingConfigService;
  
  let adminToken: string;
  let vetToken: string;
  let clientToken: string;
  
  const testVetId = 1; // Assuming this vet exists in test database
  
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    jwtService = moduleFixture.get<JwtService>(JwtService);
    schedulingService = moduleFixture.get<SchedulingService>(SchedulingService);
    timeSlotService = moduleFixture.get<TimeSlotService>(TimeSlotService);
    schedulePatternService = moduleFixture.get<SchedulePatternService>(SchedulePatternService);
    scheduleExceptionService = moduleFixture.get<ScheduleExceptionService>(ScheduleExceptionService);
    schedulingConfigService = moduleFixture.get<SchedulingConfigService>(SchedulingConfigService);
    
    // Create test tokens
    adminToken = jwtService.sign({ 
      sub: 999, 
      email: 'admin@test.com',
      roles: ['admin'] 
    });
    
    vetToken = jwtService.sign({ 
      sub: testVetId, 
      email: 'vet@test.com',
      roles: ['veterinarian'] 
    });
    
    clientToken = jwtService.sign({ 
      sub: 888, 
      email: 'client@test.com',
      roles: ['client'] 
    });
    
    // Create test scheduling config
    const configDto: CreateSchedulingConfigDto = {
      name: 'Test Config',
      description: 'Test scheduling configuration',
      slotDurationMinutes: 30,
      bufferTimeMinutes: 5,
      maxAdvanceBookingDays: 60,
      minAdvanceBookingHours: 1,
      cancellationPolicyHours: 24,
      isGlobal: false,
      isActive: true,
      veterinarianId: testVetId,
      dailySchedule: {
        monday: { 
          workingHours: [{ startTime: '09:00', endTime: '17:00' }], 
          breakTimes: [{ startTime: '12:00', endTime: '13:00' }] 
        },
        tuesday: { 
          workingHours: [{ startTime: '09:00', endTime: '17:00' }], 
          breakTimes: [{ startTime: '12:00', endTime: '13:00' }] 
        },
        wednesday: { 
          workingHours: [{ startTime: '09:00', endTime: '17:00' }], 
          breakTimes: [{ startTime: '12:00', endTime: '13:00' }] 
        },
        thursday: { 
          workingHours: [{ startTime: '09:00', endTime: '17:00' }], 
          breakTimes: [{ startTime: '12:00', endTime: '13:00' }] 
        },
        friday: { 
          workingHours: [{ startTime: '09:00', endTime: '17:00' }], 
          breakTimes: [{ startTime: '12:00', endTime: '13:00' }] 
        },
        saturday: { workingHours: [], breakTimes: [] },
        sunday: { workingHours: [], breakTimes: [] }
      }
    };
    
    try {
      await schedulingConfigService.create(configDto);
    } catch (error) {
      console.log('Config may already exist, continuing with tests');
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Scheduling Config Controller', () => {
    it('should get effective config for a veterinarian (GET /scheduling-config/effective/:veterinarianId)', async () => {
      return request(app.getHttpServer())
        .get(`/scheduling-config/effective/${testVetId}`)
        .set('Authorization', `Bearer ${vetToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toBeDefined();
          expect(res.body.veterinarianId).toBe(testVetId);
        });
    });
  });

  describe('Schedule Pattern Controller', () => {
    let patternId: string;
    
    it('should create a new schedule pattern (POST /schedule-patterns)', async () => {
      const patternDto: CreateSchedulePatternDto = {
        name: 'Test Pattern',
        description: 'Test schedule pattern',
        recurrenceType: 'WEEKLY',
        recurrenceRule: {
          daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
          interval: 1
        },
        startDate: moment().startOf('day').toDate(),
        endDate: moment().add(30, 'days').endOf('day').toDate(),
        availabilityScheduleId: 1, // Assuming this availability schedule exists
        isActive: true
      };
      
      return request(app.getHttpServer())
        .post('/schedule-patterns')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(patternDto)
        .expect(201)
        .expect(res => {
          expect(res.body).toBeDefined();
          expect(res.body.id).toBeDefined();
          patternId = res.body.id;
        });
    });
    
    it('should get occurrences for a pattern (GET /schedule-patterns/:id/occurrences)', async () => {
      return request(app.getHttpServer())
        .get(`/schedule-patterns/${patternId}/occurrences`)
        .set('Authorization', `Bearer ${vetToken}`)
        .query({ 
          startDate: moment().format('YYYY-MM-DD'),
          endDate: moment().add(14, 'days').format('YYYY-MM-DD')
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toBeDefined();
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('Time Slot Controller', () => {
    let slotId: string;
    
    it('should generate time slots for a veterinarian (POST /scheduling/generate-slots/:veterinarianId)', async () => {
      const startDate = moment().add(1, 'day').startOf('day').toISOString();
      const endDate = moment().add(7, 'days').endOf('day').toISOString();
      
      return request(app.getHttpServer())
        .post(`/scheduling/generate-slots/${testVetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ startDate, endDate })
        .expect(201)
        .expect(res => {
          expect(res.body).toBeDefined();
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
    
    it('should get available time slots (GET /time-slots/available)', async () => {
      const startDate = moment().add(1, 'day').startOf('day').toISOString();
      const endDate = moment().add(7, 'days').endOf('day').toISOString();
      
      return request(app.getHttpServer())
        .get('/time-slots/available')
        .set('Authorization', `Bearer ${clientToken}`)
        .query({ 
          startDate,
          endDate,
          veterinarianId: testVetId
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toBeDefined();
          expect(Array.isArray(res.body)).toBe(true);
          
          if (res.body.length > 0) {
            slotId = res.body[0].id;
            expect(res.body[0].status).toBe('AVAILABLE');
          }
        });
    });
    
    it('should book a time slot (PATCH /time-slots/:id/book)', async () => {
      if (!slotId) {
        console.log('No available slot to book, skipping test');
        return;
      }
      
      return request(app.getHttpServer())
        .patch(`/time-slots/${slotId}/book`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ 
          clientId: 888,
          petId: 1, // Assuming this pet exists
          notes: 'Test booking'
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toBeDefined();
          expect(res.body.id).toBe(slotId);
          expect(res.body.status).toBe('BOOKED');
        });
    });
  });

  describe('Schedule Exception Controller', () => {
    let exceptionId: string;
    
    it('should create a holiday exception (POST /scheduling/holiday/:veterinarianId)', async () => {
      const holidayData = {
        startTime: moment().add(10, 'days').startOf('day').toISOString(),
        endTime: moment().add(10, 'days').endOf('day').toISOString(),
        title: 'Test Holiday',
        description: 'Test holiday exception'
      };
      
      return request(app.getHttpServer())
        .post(`/scheduling/holiday/${testVetId}`)
        .set('Authorization', `Bearer ${vetToken}`)
        .send(holidayData)
        .expect(201)
        .expect(res => {
          expect(res.body).toBeDefined();
          expect(res.body.id).toBeDefined();
          expect(res.body.type).toBe('HOLIDAY');
          exceptionId = res.body.id;
        });
    });
    
    it('should get holidays for a veterinarian (GET /schedule-exceptions/holidays/:year)', async () => {
      const year = moment().year();
      
      return request(app.getHttpServer())
        .get(`/schedule-exceptions/holidays/${year}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .query({ veterinarianId: testVetId })
        .expect(200)
        .expect(res => {
          expect(res.body).toBeDefined();
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body.some(exception => exception.id === exceptionId)).toBe(true);
        });
    });
  });

  describe('Scheduling Service Integration', () => {
    it('should check availability for a veterinarian (GET /scheduling/availability/:veterinarianId)', async () => {
      const startDate = moment().add(1, 'day').startOf('day').toISOString();
      const endDate = moment().add(7, 'days').endOf('day').toISOString();
      
      return request(app.getHttpServer())
        .get(`/scheduling/availability/${testVetId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .query({ startDate, endDate })
        .expect(200)
        .expect(res => {
          expect(res.body).toBeDefined();
          expect(res.body.available).toBeDefined();
          expect(Array.isArray(res.body.availableSlots)).toBe(true);
        });
    });
    
    it('should resolve conflicts for a veterinarian (POST /scheduling/resolve-conflicts/:veterinarianId)', async () => {
      const startDate = moment().add(1, 'day').startOf('day').toISOString();
      const endDate = moment().add(7, 'days').endOf('day').toISOString();
      
      return request(app.getHttpServer())
        .post(`/scheduling/resolve-conflicts/${testVetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ startDate, endDate })
        .expect(200)
        .expect(res => {
          expect(res.body).toBeDefined();
          expect(res.body.resolved).toBeDefined();
          expect(res.body.errors).toBeDefined();
        });
    });
  });
});
