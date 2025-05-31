import { Injectable, NotFoundException, ConflictException, Logger } from "@nestjs/common"
import type { Repository, DataSource } from "typeorm"
import { Address } from "../entities/address.entity"
import { Pet } from "../../pet/entities/pet.entity"
import { CreateAddressDto } from "../dto/create-address.dto"
import { UpdateAddressDto } from "../dto/update-address.dto"
import { CustomerFilterDto } from "../dto/customer-filter.dto"
import { CustomerRegistrationDto } from "../dto/customer-registration.dto"
import { Customer, CustomerStatus } from "../entities/customer-pet.entity"
import { CreateCustomerDto } from "../dto/create-customer-pet.dto"
import { UpdateCustomerDto } from "../dto/update-customer-pet.dto"
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name)

  constructor(
    private customerRepository: Repository<Customer>,
    private addressRepository: Repository<Address>,
    private petRepository: Repository<Pet>,
    private dataSource: DataSource,
  ) {}

  // Customer Registration
  async register(registrationDto: CustomerRegistrationDto): Promise<Customer> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Check if email already exists
      const existingCustomer = await this.customerRepository.findOne({
        where: { email: registrationDto.email },
      })

      if (existingCustomer) {
        throw new ConflictException("Email already registered")
      }

      // Hash password (assuming you have a User entity for authentication)
      const hashedPassword = await bcrypt.hash(registrationDto.password, 10)

      // Create customer
      const customerData = {
        firstName: registrationDto.firstName,
        lastName: registrationDto.lastName,
        email: registrationDto.email,
        phoneNumber: registrationDto.phoneNumber ?? "",
        emergencyContactName: registrationDto.emergencyContactName ?? "",
        emergencyContactPhone: registrationDto.emergencyContactPhone ?? "",
        emergencyContactRelation: registrationDto.emergencyContactRelation ?? "",
      }

      const customer = queryRunner.manager.create(Customer, customerData)
      const savedCustomer = await queryRunner.manager.save(customer)

      // Create address if provided
      if (registrationDto.address) {
        const addressData = {
          ...registrationDto.address,
          customerId: savedCustomer.id,
          isPrimary: true,
        }
        const address = queryRunner.manager.create(Address, addressData)
        await queryRunner.manager.save(address)
      }

      await queryRunner.commitTransaction()

      this.logger.log(`Customer registered successfully: ${savedCustomer.email}`)
      return await this.findOne(savedCustomer.id)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error(`Error registering customer: ${errorMessage}`)
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  // CRUD Operations
  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    try {
      const existingCustomer = await this.customerRepository.findOne({
        where: { email: createCustomerDto.email },
      })

      if (existingCustomer) {
        throw new ConflictException("Email already exists")
      }

      const customer = this.customerRepository.create(createCustomerDto)
      const savedCustomer = await this.customerRepository.save(customer)

      this.logger.log(`Customer created: ${savedCustomer.id}`)
      return savedCustomer
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error(`Error creating customer: ${errorMessage}`)
      throw error
    }
  }

  async findAll(filterDto: CustomerFilterDto): Promise<{ customers: Customer[]; total: number }> {
    const queryBuilder = this.customerRepository
      .createQueryBuilder("customer")
      .leftJoinAndSelect("customer.addresses", "address")
      .leftJoinAndSelect("customer.pets", "pet")

    // Apply filters
    if (filterDto.search) {
      queryBuilder.where(
        "(customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR customer.email ILIKE :search)",
        { search: `%${filterDto.search}%` },
      )
    }

    if (filterDto.status) {
      queryBuilder.andWhere("customer.status = :status", { status: filterDto.status })
    }

    if (filterDto.customerType) {
      queryBuilder.andWhere("customer.customerType = :customerType", { customerType: filterDto.customerType })
    }

    if (filterDto.isEmailVerified !== undefined) {
      queryBuilder.andWhere("customer.isEmailVerified = :isEmailVerified", {
        isEmailVerified: filterDto.isEmailVerified,
      })
    }

    if (filterDto.isPhoneVerified !== undefined) {
      queryBuilder.andWhere("customer.isPhoneVerified = :isPhoneVerified", {
        isPhoneVerified: filterDto.isPhoneVerified,
      })
    }

    // Sorting
    queryBuilder.orderBy(`customer.${filterDto.sortBy}`, filterDto.sortOrder)

    // Pagination
    const total = await queryBuilder.getCount()
    const page = filterDto.page ?? 1
    const limit = filterDto.limit ?? 10
    const customers = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany()

    return { customers, total }
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ["addresses", "pets"],
    })

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`)
    }

    return customer
  }

  async findByEmail(email: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { email },
      relations: ["addresses", "pets"],
    })

    if (!customer) {
      throw new NotFoundException(`Customer with email ${email} not found`)
    }

    return customer
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id)

    // Check if email is being changed and if it already exists
    if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
      const existingCustomer = await this.customerRepository.findOne({
        where: { email: updateCustomerDto.email },
      })

      if (existingCustomer) {
        throw new ConflictException("Email already exists")
      }
    }

    Object.assign(customer, updateCustomerDto)
    const updatedCustomer = await this.customerRepository.save(customer)

    this.logger.log(`Customer updated: ${updatedCustomer.id}`)
    return updatedCustomer
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id)
    customer.status = CustomerStatus.INACTIVE
    await this.customerRepository.save(customer)

    this.logger.log(`Customer deactivated: ${id}`)
  }

  // Address Management
  async addAddress(createAddressDto: CreateAddressDto): Promise<Address> {
    const customer = await this.findOne(createAddressDto.customerId)

    // If this is set as primary, unset other primary addresses
    if (createAddressDto.isPrimary) {
      await this.addressRepository.update({ customerId: customer.id, isPrimary: true }, { isPrimary: false })
    }

    const address = this.addressRepository.create(createAddressDto)
    const savedAddress = await this.addressRepository.save(address)

    this.logger.log(`Address added for customer: ${customer.id}`)
    return savedAddress
  }

  async updateAddress(addressId: string, updateAddressDto: UpdateAddressDto): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId },
      relations: ["customer"],
    })

    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found`)
    }

    // If this is set as primary, unset other primary addresses
    if (updateAddressDto.isPrimary) {
      await this.addressRepository.update({ customerId: address.customerId, isPrimary: true }, { isPrimary: false })
    }

    Object.assign(address, updateAddressDto)
    const updatedAddress = await this.addressRepository.save(address)

    this.logger.log(`Address updated: ${addressId}`)
    return updatedAddress
  }

  async removeAddress(addressId: string): Promise<void> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId },
    })

    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found`)
    }

    address.isActive = false
    await this.addressRepository.save(address)

    this.logger.log(`Address deactivated: ${addressId}`)
  }

  async getCustomerAddresses(customerId: string): Promise<Address[]> {
    await this.findOne(customerId) // Verify customer exists

    return await this.addressRepository.find({
      where: { customerId, isActive: true },
      order: { isPrimary: "DESC", createdAt: "ASC" },
    })
  }

  // Customer Dashboard Data
  async getDashboardData(customerId: string): Promise<any> {
    const customer = await this.findOne(customerId)

    const activePets = await this.petRepository.find({
      where: { customerId, isActive: true },
      order: { name: "ASC" },
    })

    const addresses = await this.getCustomerAddresses(customerId)

    // Get recent activity (you can expand this based on your needs)
    interface RecentActivityItem {
      type: string
      description: string
      date: Date
    }

    const recentActivity: RecentActivityItem[] = [] 

    return {
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        status: customer.status,
        memberSince: customer.createdAt,
        lastLogin: customer.lastLoginAt,
      },
      pets: activePets.map((pet) => ({
      
      })),
      addresses: addresses.map((addr) => ({
        id: addr.id,
        type: addr.type,
        fullAddress: addr.fullAddress,
        isPrimary: addr.isPrimary,
      })),
      statistics: {
        totalPets: activePets.length,
        totalAddresses: addresses.length,
        accountAge: Math.floor((Date.now() - customer.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
      },
      recentActivity,
    }
  }

  // Customer Statistics
  async getCustomerStatistics(): Promise<any> {
    const totalCustomers = await this.customerRepository.count()
    const activeCustomers = await this.customerRepository.count({
      where: { status: CustomerStatus.ACTIVE },
    })
    const verifiedEmails = await this.customerRepository.count({
      where: { isEmailVerified: true },
    })
    const verifiedPhones = await this.customerRepository.count({
      where: { isPhoneVerified: true },
    })

    const recentRegistrations = await this.customerRepository.count({
      where: {
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    })

    return {
      totalCustomers,
      activeCustomers,
      inactiveCustomers: totalCustomers - activeCustomers,
      verifiedEmails,
      verifiedPhones,
      recentRegistrations,
      verificationRate: totalCustomers > 0 ? ((verifiedEmails / totalCustomers) * 100).toFixed(2) : 0,
    }
  }

  // Update last login
  async updateLastLogin(customerId: string): Promise<void> {
    await this.customerRepository.update(customerId, {
      lastLoginAt: new Date(),
    });
  }

  // Verify email
  async verifyEmail(customerId: string): Promise<Customer> {
    const customer = await this.findOne(customerId)
    customer.isEmailVerified = true
    return await this.customerRepository.save(customer)
  }

  // Verify phone
  async verifyPhone(customerId: string): Promise<Customer> {
    const customer = await this.findOne(customerId)
    customer.isPhoneVerified = true
    return await this.customerRepository.save(customer)
  }
}
