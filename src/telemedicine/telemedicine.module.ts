import { Module } from '@nestjs/common';
import { TelemedicineController } from './controllers/telemedicine.controller';
import { TelemedicineService } from './services/telemedicine.service';

@Module({
  controllers: [TelemedicineController],
  providers: [TelemedicineService],
})
export class TelemedicineModule {}
