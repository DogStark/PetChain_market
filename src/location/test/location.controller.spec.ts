import { Test, TestingModule } from '@nestjs/testing';
import { LocationsController } from '../location.controller';
import { LocationService } from '../location.service';

describe('LocationsController', () => {
  let controller: LocationsController;
  let service: LocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationsController],
      providers: [
        {
          provide: LocationService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LocationsController>(LocationsController);
    service = module.get<LocationService>(LocationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all locations', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([]);
    expect(service.findAll).toHaveBeenCalled();
  });
});
