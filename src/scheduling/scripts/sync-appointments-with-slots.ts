import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { TimeSlotService } from '../services/time-slot.service';
import * as moment from 'moment';

/**
 * This script synchronizes existing appointments with the new time slot system.
 * It finds all existing appointments and creates or updates corresponding time slots.
 * This ensures a smooth transition from the old appointment system to the new scheduling system.
 * 
 * Usage:
 * npx ts-node -r tsconfig-paths/register src/scheduling/scripts/sync-appointments-with-slots.ts
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    // Get necessary services
    const timeSlotService = app.get(TimeSlotService);
    
    // Get the appointment service - this will need to be updated based on your actual appointment service
    const appointmentService = app.get('AppointmentService');
    
    console.log('Starting appointment synchronization with time slots...');
    
    // Get all active appointments
    const startDate = moment().startOf('day').subtract(30, 'days').toDate(); // Include recent past appointments
    const endDate = moment().add(90, 'days').endOf('day').toDate(); // And future appointments
    
    console.log(`Fetching appointments from ${startDate} to ${endDate}`);
    const appointments = await appointmentService.findAllInDateRange(startDate, endDate);
    
    console.log(`Found ${appointments.length} appointments to synchronize`);
    
    let created = 0;
    let updated = 0;
    let errors = 0;
    
    // Process each appointment
    for (const appointment of appointments) {
      try {
        // Check if a time slot already exists for this appointment
        const existingSlots = await timeSlotService.findByDateRangeAndVeterinarian(
          appointment.startTime,
          appointment.endTime,
          appointment.veterinarianId
        );
        
        const matchingSlot = existingSlots.find(slot => 
          moment(slot.startTime).isSame(moment(appointment.startTime)) && 
          moment(slot.endTime).isSame(moment(appointment.endTime))
        );
        
        if (matchingSlot) {
          // Update the existing slot if needed
          if (matchingSlot.status !== 'BOOKED' || matchingSlot.appointmentId !== appointment.id) {
            await timeSlotService.update(matchingSlot.id, {
              status: 'BOOKED',
              appointmentId: appointment.id,
              clientId: appointment.clientId,
              petId: appointment.petId,
              notes: `Synchronized from appointment #${appointment.id}`
            });
            updated++;
            console.log(`Updated time slot ${matchingSlot.id} for appointment ${appointment.id}`);
          }
        } else {
          // Create a new time slot for this appointment
          const newSlot = await timeSlotService.create({
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            veterinarianId: appointment.veterinarianId,
            status: 'BOOKED',
            appointmentId: appointment.id,
            clientId: appointment.clientId,
            petId: appointment.petId,
            notes: `Created from existing appointment #${appointment.id}`,
            isActive: true
          });
          created++;
          console.log(`Created new time slot ${newSlot.id} for appointment ${appointment.id}`);
        }
      } catch (error) {
        console.error(`Error processing appointment ${appointment.id}:`, error.message);
        errors++;
      }
    }
    
    console.log('Appointment synchronization completed!');
    console.log(`Summary: ${created} slots created, ${updated} slots updated, ${errors} errors`);
    
  } catch (error) {
    console.error('Error during appointment synchronization:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
