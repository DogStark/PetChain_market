import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Entities
import { Veterinarian } from './entities/veterinarian.entity';
import { Credential } from './entities/credential.entity';
import { AvailabilitySchedule } from './entities/availability-schedule.entity';
import { Staff } from './entities/staff.entity';
import { StaffRole } from './entities/staff-role.entity';
import { Specialization } from './entities/specialization.entity';

// Services
import { VeterinarianService } from './services/veterinarian.service';
import { CredentialService } from './services/credential.service';
import { AvailabilityScheduleService } from './services/availability-schedule.service';
import { StaffService } from './services/staff.service';
import { StaffRoleService } from './services/staff-role.service';

// Controllers
import { VeterinarianController } from './controllers/veterinarian.controller';
import { CredentialController } from './controllers/credential.controller';
import { AvailabilityScheduleController } from './controllers/availability-schedule.controller';
import { StaffController } from './controllers/staff.controller';
import { StaffRoleController } from './controllers/staff-role.controller';
import { SpecializationController } from './controllers/specialization.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres', // or 'mysql', 'sqlite', etc.
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'vet_management',
      entities: [
        Veterinarian,
        Credential,
        AvailabilitySchedule,
        Staff,
        StaffRole,
        Specialization,
      ],
      synchronize: process.env.NODE_ENV !== 'production', // Only for development
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([
      Veterinarian,
      Credential,
      AvailabilitySchedule,
      Staff,
      StaffRole,
      Specialization,
    ]),
  ],
  controllers: [
    VeterinarianController,
    CredentialController,
    AvailabilityScheduleController,
    StaffController,
    StaffRoleController,
    SpecializationController,
  ],
  providers: [
    VeterinarianService,
    CredentialService,
    AvailabilityScheduleService,
    StaffService,
    StaffRoleService,
  ],
})
export class AppModule {}