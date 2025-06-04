import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SchedulingConfigService } from '../services/scheduling-config.service';
import { VeterinarianService } from '../../Veterinarian and Staff Module/entities/dto/services/veterinarian.service';
import { CreateSchedulingConfigDto } from '../dto/create-scheduling-config.dto';

/**
 * This script initializes default scheduling configurations for all active veterinarians.
 * It creates a global default configuration if one doesn't exist, and then creates
 * individual configurations for each veterinarian based on the global defaults.
 * 
 * Usage:
 * npx ts-node -r tsconfig-paths/register src/scheduling/scripts/initialize-scheduling-config.ts
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const schedulingConfigService = app.get(SchedulingConfigService);
    const veterinarianService = app.get(VeterinarianService);
    
    console.log('Starting scheduling configuration initialization...');
    
    // Create or get global default configuration
    let globalConfig;
    try {
      globalConfig = await schedulingConfigService.getGlobalConfig();
      console.log('Global configuration already exists, using existing config');
    } catch (error) {
      console.log('Creating new global configuration...');
      
      // Default global configuration
      const defaultGlobalConfig: CreateSchedulingConfigDto = {
        name: 'Global Default Configuration',
        description: 'Default scheduling configuration for all veterinarians',
        slotDurationMinutes: 30,
        bufferTimeMinutes: 5,
        maxAdvanceBookingDays: 60,
        minAdvanceBookingHours: 1,
        cancellationPolicyHours: 24,
        isGlobal: true,
        isActive: true,
        dailySchedule: {
          monday: { workingHours: [{ startTime: '09:00', endTime: '17:00' }], breakTimes: [{ startTime: '12:00', endTime: '13:00' }] },
          tuesday: { workingHours: [{ startTime: '09:00', endTime: '17:00' }], breakTimes: [{ startTime: '12:00', endTime: '13:00' }] },
          wednesday: { workingHours: [{ startTime: '09:00', endTime: '17:00' }], breakTimes: [{ startTime: '12:00', endTime: '13:00' }] },
          thursday: { workingHours: [{ startTime: '09:00', endTime: '17:00' }], breakTimes: [{ startTime: '12:00', endTime: '13:00' }] },
          friday: { workingHours: [{ startTime: '09:00', endTime: '17:00' }], breakTimes: [{ startTime: '12:00', endTime: '13:00' }] },
          saturday: { workingHours: [{ startTime: '10:00', endTime: '14:00' }], breakTimes: [] },
          sunday: { workingHours: [], breakTimes: [] }
        }
      };
      
      globalConfig = await schedulingConfigService.create(defaultGlobalConfig);
      console.log('Global configuration created successfully');
    }
    
    // Get all active veterinarians
    const veterinarians = await veterinarianService.findAll();
    console.log(`Found ${veterinarians.length} veterinarians`);
    
    // Create individual configurations for each veterinarian if they don't already have one
    for (const vet of veterinarians) {
      try {
        // Check if veterinarian already has a configuration
        const existingConfig = await schedulingConfigService.findByVeterinarian(vet.id);
        console.log(`Veterinarian ${vet.id} already has a configuration`);
      } catch (error) {
        // Create new configuration for this veterinarian
        console.log(`Creating configuration for veterinarian ${vet.id}...`);
        
        const vetConfig: CreateSchedulingConfigDto = {
          name: `${vet.firstName} ${vet.lastName}'s Schedule Configuration`,
          description: `Custom scheduling configuration for ${vet.firstName} ${vet.lastName}`,
          slotDurationMinutes: globalConfig.slotDurationMinutes,
          bufferTimeMinutes: globalConfig.bufferTimeMinutes,
          maxAdvanceBookingDays: globalConfig.maxAdvanceBookingDays,
          minAdvanceBookingHours: globalConfig.minAdvanceBookingHours,
          cancellationPolicyHours: globalConfig.cancellationPolicyHours,
          isGlobal: false,
          isActive: true,
          veterinarianId: vet.id,
          dailySchedule: JSON.parse(JSON.stringify(globalConfig.dailySchedule)) // Deep copy of the global daily schedule
        };
        
        await schedulingConfigService.create(vetConfig);
        console.log(`Configuration for veterinarian ${vet.id} created successfully`);
      }
    }
    
    console.log('Scheduling configuration initialization completed!');
  } catch (error) {
    console.error('Error during scheduling configuration initialization:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
