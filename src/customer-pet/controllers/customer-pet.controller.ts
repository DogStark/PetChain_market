import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  ValidationPipe,
  UsePipes,
} from "@nestjs/common"
import type { CreateAddressDto } from "../dto/create-address.dto"
import type { UpdateAddressDto } from "../dto/update-address.dto"
import type { CustomerFilterDto } from "../dto/customer-filter.dto"
import type { CustomerRegistrationDto } from "../dto/customer-registration.dto"
import { CreateCustomerDto } from "../dto/create-customer-pet.dto"
import { CustomerService } from "../providers/customer-pet.service"
import { UpdateCustomerDto } from "../dto/update-customer-pet.dto"

@Controller("customers")
@UsePipes(new ValidationPipe({ transform: true }))
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // Customer Registration
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registrationDto: CustomerRegistrationDto) {
    const customer = await this.customerService.register(registrationDto);
    return {
      success: true,
      message: 'Customer registered successfully',
      data: customer
    };
  }

  // CRUD Operations
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    const customer = await this.customerService.create(createCustomerDto);
    return {
      success: true,
      message: 'Customer created successfully',
      data: customer
    };
  }

  @Get()
  async findAll(@Query() filterDto: CustomerFilterDto) {
    const result = await this.customerService.findAll(filterDto);
    return {
      success: true,
      data: result.customers,
      pagination: {
        page: filterDto.page,
        limit: filterDto.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / (filterDto.limit ?? 1))
      }
    };
  }

  @Get("statistics")
  async getStatistics() {
    const statistics = await this.customerService.getCustomerStatistics()
    return {
      success: true,
      data: statistics,
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const customer = await this.customerService.findOne(id);
    return {
      success: true,
      data: customer
    };
  }

  @Get(':id/dashboard')
  async getDashboard(@Param('id', ParseUUIDPipe) id: string) {
    const dashboardData = await this.customerService.getDashboardData(id);
    return {
      success: true,
      data: dashboardData
    };
  }

  @Patch(":id")
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.customerService.update(id, updateCustomerDto)
    return {
      success: true,
      message: "Customer updated successfully",
      data: customer,
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.customerService.remove(id);
    return {
      success: true,
      message: 'Customer deactivated successfully'
    };
  }

  // Address Management
  @Post('addresses')
  @HttpCode(HttpStatus.CREATED)
  async addAddress(@Body() createAddressDto: CreateAddressDto) {
    const address = await this.customerService.addAddress(createAddressDto);
    return {
      success: true,
      message: 'Address added successfully',
      data: address
    };
  }

  @Get(':id/addresses')
  async getAddresses(@Param('id', ParseUUIDPipe) customerId: string) {
    const addresses = await this.customerService.getCustomerAddresses(customerId);
    return {
      success: true,
      data: addresses
    };
  }

  @Patch("addresses/:addressId")
  async updateAddress(
    @Param('addressId', ParseUUIDPipe) addressId: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    const address = await this.customerService.updateAddress(addressId, updateAddressDto)
    return {
      success: true,
      message: "Address updated successfully",
      data: address,
    }
  }

  @Delete('addresses/:addressId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAddress(@Param('addressId', ParseUUIDPipe) addressId: string) {
    await this.customerService.removeAddress(addressId);
    return {
      success: true,
      message: 'Address deactivated successfully'
    };
  }

  // Verification endpoints
  @Patch(':id/verify-email')
  async verifyEmail(@Param('id', ParseUUIDPipe) id: string) {
    const customer = await this.customerService.verifyEmail(id);
    return {
      success: true,
      message: 'Email verified successfully',
      data: customer
    };
  }

  @Patch(':id/verify-phone')
  async verifyPhone(@Param('id', ParseUUIDPipe) id: string) {
    const customer = await this.customerService.verifyPhone(id);
    return {
      success: true,
      message: 'Phone verified successfully',
      data: customer
    };
  }

  @Patch(':id/last-login')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLastLogin(@Param('id', ParseUUIDPipe) id: string) {
    await this.customerService.updateLastLogin(id);
    return {
      success: true,
      message: 'Last login updated successfully'
    };
  }

  // Search by email
  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    const customer = await this.customerService.findByEmail(email);
    return {
      success: true,
      data: customer
    };
  }
}
