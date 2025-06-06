import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchedulingConfig } from '../entities/scheduling-config.entity';
import { CreateSchedulingConfigDto } from '../dto/create-scheduling-config.dto';
import { UpdateSchedulingConfigDto } from '../dto/update-scheduling-config.dto';

@Injectable()
export class SchedulingConfigService {
  constructor(
    @InjectRepository(SchedulingConfig)
    private configRepository: Repository<SchedulingConfig>,
  ) {}

  async create(createConfigDto: CreateSchedulingConfigDto): Promise<SchedulingConfig> {
    // Check if a config already exists for this veterinarian
    if (createConfigDto.veterinarianId) {
      const existingConfig = await this.configRepository.findOne({
        where: { veterinarianId: createConfigDto.veterinarianId, isActive: true }
      });
      
      if (existingConfig) {
        // Update existing config instead of creating a new one
        return this.update(existingConfig.id, createConfigDto);
      }
    }
    
    // Create new config
    const config = this.configRepository.create(createConfigDto);
    return this.configRepository.save(config);
  }

  async findAll(): Promise<SchedulingConfig[]> {
    return this.configRepository.find({
      where: { isActive: true },
      relations: ['veterinarian'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<SchedulingConfig> {
    const config = await this.configRepository.findOne({
      where: { id },
      relations: ['veterinarian']
    });
    
    if (!config) {
      throw new NotFoundException(`Scheduling config with ID ${id} not found`);
    }
    
    return config;
  }

  async findByVeterinarian(veterinarianId: number): Promise<SchedulingConfig> {
    const config = await this.configRepository.findOne({
      where: { veterinarianId, isActive: true }
    });
    
    if (!config) {
      // Return global config if no veterinarian-specific config exists
      return this.getGlobalConfig();
    }
    
    return config;
  }

  async getGlobalConfig(): Promise<SchedulingConfig> {
    let config = await this.configRepository.findOne({
      where: { veterinarianId: null, isActive: true }
    });
    
    if (!config) {
      // Create default global config if none exists
      config = await this.createDefaultGlobalConfig();
    }
    
    return config;
  }

  async update(id: string, updateConfigDto: UpdateSchedulingConfigDto): Promise<SchedulingConfig> {
    const config = await this.findOne(id);
    
    Object.assign(config, updateConfigDto);
    
    return this.configRepository.save(config);
  }

  async remove(id: string): Promise<void> {
    const result = await this.configRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Scheduling config with ID ${id} not found`);
    }
  }

  async deactivate(id: string): Promise<SchedulingConfig> {
    const config = await this.findOne(id);
    config.isActive = false;
    return this.configRepository.save(config);
  }

  async getEffectiveConfig(veterinarianId?: number): Promise<SchedulingConfig> {
    if (veterinarianId) {
      // Try to get veterinarian-specific config
      try {
        const vetConfig = await this.findByVeterinarian(veterinarianId);
        return vetConfig;
      } catch (error) {
        // Fall back to global config if not found
        return this.getGlobalConfig();
      }
    } else {
      // Return global config
      return this.getGlobalConfig();
    }
  }

  private async createDefaultGlobalConfig(): Promise<SchedulingConfig> {
    const defaultConfig = this.configRepository.create({
      defaultSlotDurationMinutes: 30,
      bufferTimeMinutes: 0,
      maxDaysInAdvance: 30,
      minHoursBeforeBooking: 1,
      cancellationPolicyHours: 24,
      allowRecurringAppointments: true,
      allowOverlappingAppointments: false,
      autoConfirmAppointments: true,
      workingHours: {
        monday: [{ start: '09:00', end: '17:00' }],
        tuesday: [{ start: '09:00', end: '17:00' }],
        wednesday: [{ start: '09:00', end: '17:00' }],
        thursday: [{ start: '09:00', end: '17:00' }],
        friday: [{ start: '09:00', end: '17:00' }],
        saturday: [],
        sunday: []
      },
      breakTimes: {
        monday: [{ start: '12:00', end: '13:00' }],
        tuesday: [{ start: '12:00', end: '13:00' }],
        wednesday: [{ start: '12:00', end: '13:00' }],
        thursday: [{ start: '12:00', end: '13:00' }],
        friday: [{ start: '12:00', end: '13:00' }],
        saturday: [],
        sunday: []
      },
      isActive: true,
      veterinarianId: null
    });
    
    return this.configRepository.save(defaultConfig);
  }
}
