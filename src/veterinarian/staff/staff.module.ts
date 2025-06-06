import { Module } from '@nestjs/common';
import { StaffController } from './controllers/staff.controller';
import { StaffService } from './services/staff.service';

@Module({
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
