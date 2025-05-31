import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Address } from "../entities/address.entity"
import { Pet } from "../../pet/entities/pet.entity"
import { DataSource } from "typeorm"
import { CustomerController } from "./customer-pet.controller"
import { Customer } from "../entities/customer-pet.entity"
import { CustomerService } from "../providers/customer-pet.service"

describe("CustomerController", () => {
  let controller: CustomerController
  let service: CustomerService

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  }

  const mockDataSource = {
    createQueryRunner: jest.fn(() => ({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        create: jest.fn(),
        save: jest.fn(),
      },
    })),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        CustomerService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Address),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Pet),
          useValue: mockRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile()

    controller = module.get<CustomerController>(CustomerController)
    service = module.get<CustomerService>(CustomerService)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })

  it("should be able to create a customer", () => {
    expect(controller.create).toBeDefined()
  })

  it("should be able to find all customers", () => {
    expect(controller.findAll).toBeDefined()
  })

  it("should be able to find one customer", () => {
    expect(controller.findOne).toBeDefined()
  })

  it("should be able to update a customer", () => {
    expect(controller.update).toBeDefined()
  })

  it("should be able to remove a customer", () => {
    expect(controller.remove).toBeDefined()
  })
})
