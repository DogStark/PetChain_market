import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { SchedulingConfigService } from '../services/scheduling-config.service';
import { CreateSchedulingConfigDto } from '../dto/create-scheduling-config.dto';
import { UpdateSchedulingConfigDto } from '../dto/update-scheduling-config.dto';
import { SchedulingConfig } from '../entities/scheduling-config.entity';

@ApiTags('scheduling-config')
@Controller('scheduling-config')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SchedulingConfigController {
  constructor(private readonly schedulingConfigService: SchedulingConfigService) {}

  @Post()
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Create a new scheduling configuration' })
  @ApiResponse({ status: 201, description: 'The scheduling configuration has been successfully created.', type: SchedulingConfig })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createSchedulingConfigDto: CreateSchedulingConfigDto): Promise<SchedulingConfig> {
    return this.schedulingConfigService.create(createSchedulingConfigDto);
  }

  @Get()
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Get all scheduling configurations' })
  @ApiResponse({ status: 200, description: 'Return all scheduling configurations.', type: [SchedulingConfig] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(): Promise<SchedulingConfig[]> {
    return this.schedulingConfigService.findAll();
  }

  @Get('global')
  @Roles('admin', 'veterinarian', 'staff', 'client')
  @ApiOperation({ summary: 'Get global scheduling configuration' })
  @ApiResponse({ status: 200, description: 'Return the global scheduling configuration.', type: SchedulingConfig })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getGlobalConfig(): Promise<SchedulingConfig> {
    return this.schedulingConfigService.getGlobalConfig();
  }

  @Get('veterinarian/:id')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Get scheduling configuration for a veterinarian' })
  @ApiResponse({ status: 200, description: 'Return the scheduling configuration for the veterinarian.', type: SchedulingConfig })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findByVeterinarian(@Param('id') id: string): Promise<SchedulingConfig> {
    return this.schedulingConfigService.findByVeterinarian(+id);
  }

  @Get('effective/:veterinarianId')
  @Roles('admin', 'veterinarian', 'staff', 'client')
  @ApiOperation({ summary: 'Get effective scheduling configuration for a veterinarian' })
  @ApiResponse({ status: 200, description: 'Return the effective scheduling configuration.', type: SchedulingConfig })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getEffectiveConfig(@Param('veterinarianId') veterinarianId: string): Promise<SchedulingConfig> {
    return this.schedulingConfigService.getEffectiveConfig(+veterinarianId);
  }

  @Get(':id')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Get a scheduling configuration by ID' })
  @ApiResponse({ status: 200, description: 'Return the scheduling configuration.', type: SchedulingConfig })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Scheduling configuration not found.' })
  findOne(@Param('id') id: string): Promise<SchedulingConfig> {
    return this.schedulingConfigService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Update a scheduling configuration' })
  @ApiResponse({ status: 200, description: 'The scheduling configuration has been successfully updated.', type: SchedulingConfig })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Scheduling configuration not found.' })
  update(
    @Param('id') id: string,
    @Body() updateSchedulingConfigDto: UpdateSchedulingConfigDto,
  ): Promise<SchedulingConfig> {
    return this.schedulingConfigService.update(id, updateSchedulingConfigDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a scheduling configuration' })
  @ApiResponse({ status: 200, description: 'The scheduling configuration has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Scheduling configuration not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.schedulingConfigService.remove(id);
  }

  @Patch(':id/deactivate')
  @Roles('admin', 'veterinarian', 'staff')
  @ApiOperation({ summary: 'Deactivate a scheduling configuration' })
  @ApiResponse({ status: 200, description: 'The scheduling configuration has been successfully deactivated.', type: SchedulingConfig })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Scheduling configuration not found.' })
  deactivate(@Param('id') id: string): Promise<SchedulingConfig> {
    return this.schedulingConfigService.deactivate(id);
  }
}
