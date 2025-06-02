import { Test, TestingModule } from '@nestjs/testing';
import { TriageController } from './triage.controller';
import { TriageService } from './triage.service';

describe('TriageController', () => {
  let controller: TriageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TriageController],
      providers: [TriageService],
    }).compile();

    controller = module.get<TriageController>(TriageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
