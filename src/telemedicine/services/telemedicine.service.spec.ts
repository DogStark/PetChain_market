import { Test, TestingModule } from '@nestjs/testing';
import { TelemedicineService } from '../telemedicine.service';

describe('TelemedicineService', () => {
  let service: TelemedicineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TelemedicineService],
    }).compile();

    service = module.get<TelemedicineService>(TelemedicineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
