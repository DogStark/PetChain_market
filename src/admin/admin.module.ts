import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '@/user/entities/user.entity'; 
import { AuditLog } from './entities/audit-log.entity';
import { ConfigEntity } from './entities/config.entity';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AuditLog, ConfigEntity]),
    TerminusModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
