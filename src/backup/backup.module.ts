import { Module } from '@nestjs/common';
import { BackupService } from './services/backup.service';
import { BackupController } from './controllers/backup.controller';
import { BackupSchedulerService } from './services/backup-scheduler.service';
import { RecoveryService } from './services/recovery.service';
import { BackupMonitoringService } from './services/backup-monitoring.service';

@Module({
  controllers: [BackupController],
  providers: [
    BackupService,
    BackupSchedulerService,
    RecoveryService,
    BackupMonitoringService,
  ],
  exports: [BackupService, RecoveryService],
})
export class BackupModule {}