import { Test, TestingModule } from '@nestjs/testing';
import { TelemedicineController } from '../telemedicine.controller';
import { TelemedicineService } from '../telemedicine.service';

describe('TelemedicineController', () => {
  let controller: TelemedicineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TelemedicineController],
      providers: [TelemedicineService],
    }).compile();

    controller = module.get<TelemedicineController>(TelemedicineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
