import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SchedulingService } from '../services/scheduling.service';
import { AvailabilityScheduleService } from '../../Veterinarian and Staff Module/entities/dto/services/availability-schedule.service';
import * as moment from 'moment';

/**
 * This script generates initial time slots for all veterinarians with active availability schedules.
 * It can be run to populate the system with time slots for the next 30 days.
 * 
 * Usage:
 * npx ts-node -r tsconfig-paths/register src/scheduling/scripts/generate-initial-slots.ts
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const schedulingService = app.get(SchedulingService);
    const availabilityScheduleService = app.get(AvailabilityScheduleService);
    
    console.log('Starting time slot generation...');
    
    // Get all active veterinarians with availability schedules
    const availabilitySchedules = await availabilityScheduleService.findAll();
    
    // Group schedules by veterinarian
    const schedulesByVet = availabilitySchedules.reduce((acc, schedule) => {
      if (!acc[schedule.veterinarianId]) {
        acc[schedule.veterinarianId] = [];
      }
      acc[schedule.veterinarianId].push(schedule);
      return acc;
    }, {});
    
    // Generate time slots for each veterinarian for the next 30 days
    const startDate = moment().startOf('day').toDate();
    const endDate = moment().add(30, 'days').endOf('day').toDate();
    
    console.log(`Generating slots from ${startDate} to ${endDate}`);
    
    for (const [vetId, schedules] of Object.entries(schedulesByVet)) {
      if (schedules.length > 0) {
        console.log(`Generating slots for veterinarian ID: ${vetId}`);
        
        try {
          const slots = await schedulingService.generateTimeSlots(
            parseInt(vetId),
            startDate,
            endDate
          );
          
          console.log(`Generated ${slots.length} slots for veterinarian ID: ${vetId}`);
        } catch (error) {
          console.error(`Error generating slots for veterinarian ID: ${vetId}`, error.message);
        }
      }
    }
    
    console.log('Time slot generation completed!');
  } catch (error) {
    console.error('Error during time slot generation:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
