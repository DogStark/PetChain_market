import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PetModule } from './pet/pet.module';
import { MedicalRecordModule } from './medical_record/medical_record.module';
import { ShoppingCartModule } from './shopping_cart/shopping_cart.module';
import { StaffModule } from './veterinarian/staff/staff.module';
import { EmergencyModule } from './emergency/emergency.module';
import { TelemedicineModule } from './telemedicine/telemedicine.module';
import { CustomerModule } from './customer-pet/customer-pet.module';

@Module({
  imports: [UserModule, AuthModule, PetModule, MedicalRecordModule, ShoppingCartModule, StaffModule, EmergencyModule, TelemedicineModule, CustomerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
