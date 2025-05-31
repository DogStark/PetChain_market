import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Address } from "../entities/address.entity"
import { Pet } from "../../pet/entities/pet.entity"
import { DataSource } from "typeorm"

describe("CustomerService", () => {
  let service: CustomerService

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
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

    service = module.get<CustomerService>(CustomerService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  it("should be able to create a customer", () => {
    expect(service.create).toBeDefined()
  })

  it("should be able to register a customer", () => {
    expect(service.register).toBeDefined()
  })

  it("should be able to find all customers", () => {
    expect(service.findAll).toBeDefined()
  })

  it("should be able to find one customer", () => {
    expect(service.findOne).toBeDefined()
  })

  it("should be able to update a customer", () => {
    expect(service.update).toBeDefined()
  })

  it("should be able to remove a customer", () => {
    expect(service.remove).toBeDefined()
  })
})
