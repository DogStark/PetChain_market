import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return "Hello World!" message', () => {
      const result = 'Hello World! NestJS application is running successfully.';
      jest.spyOn(appService, 'getHello').mockImplementation(() => result);

      expect(appController.getHello()).toBe(result);
    });
  });

  describe('health', () => {
    it('should return health status', () => {
      const result = { status: 'OK', timestamp: '2024-01-01T00:00:00.000Z' };
      jest.spyOn(appService, 'getHealth').mockImplementation(() => result);

      expect(appController.getHealth()).toBe(result);
    });
  });
});