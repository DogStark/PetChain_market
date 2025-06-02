import { Test, TestingModule } from '@nestjs/testing';
import { EmergencyBookingService } from './emergency-booking.service';

describe('EmergencyBookingService', () => {
  let service: EmergencyBookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmergencyBookingService],
    }).compile();

    service = module.get<EmergencyBookingService>(EmergencyBookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
