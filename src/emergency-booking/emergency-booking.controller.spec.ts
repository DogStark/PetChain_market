import { Test, TestingModule } from '@nestjs/testing';
import { EmergencyBookingController } from './emergency-booking.controller';
import { EmergencyBookingService } from './emergency-booking.service';

describe('EmergencyBookingController', () => {
  let controller: EmergencyBookingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmergencyBookingController],
      providers: [EmergencyBookingService],
    }).compile();

    controller = module.get<EmergencyBookingController>(EmergencyBookingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
