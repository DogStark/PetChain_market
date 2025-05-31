import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BackupService } from './backup.service';
import { BackupMonitoringService } from './backup-monitoring.service';

@Injectable()
export class BackupSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(BackupSchedulerService.name);

  constructor(
    private readonly backupService: BackupService,
    private readonly monitoringService: BackupMonitoringService,
  ) {}

  onModuleInit() {
    this.logger.log('Backup scheduler initialized');
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async scheduledFullBackup() {
    this.logger.log('Starting scheduled full backup');
    
    try {
      const backup = await this.backupService.createFullBackup();
      await this.monitoringService.recordBackupSuccess(backup);
      
      const isValid = await this.backupService.verifyBackupIntegrity(backup.id);
      if (!isValid) {
        await this.monitoringService.recordBackupWarning(backup.id, 'Integrity check failed');
      }
      
      await this.backupService.cleanupOldBackups();
      
    } catch (error) {
      this.logger.error('Scheduled full backup failed', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.monitoringService.recordBackupFailure('scheduled_full', errorMessage);
    }
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async scheduledIncrementalBackup() {
    this.logger.log('Starting scheduled incremental backup');
    
    try {
      const lastBackupTime = await this.getLastBackupTime();
      const backup = await this.backupService.createIncrementalBackup(lastBackupTime);
      await this.monitoringService.recordBackupSuccess(backup);
      
    } catch (error) {
      this.logger.error('Scheduled incremental backup failed', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.monitoringService.recordBackupFailure('scheduled_incremental', errorMessage);
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async scheduledBackupVerification() {
    this.logger.log('Starting scheduled backup verification');
    
    try {
      const recentBackups = await this.getRecentBackups(7); 
      
      for (const backup of recentBackups) {
        const isValid = await this.backupService.verifyBackupIntegrity(backup.id);
        if (!isValid) {
          await this.monitoringService.recordBackupWarning(backup.id, 'Weekly integrity check failed');
        }
      }
      
    } catch (error) {
      this.logger.error('Scheduled backup verification failed', error);
    }
  }

  private async getLastBackupTime(): Promise<Date> {
    const sixHoursAgo = new Date();
    sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);
    return sixHoursAgo;
  }

  private async getRecentBackups(days: number): Promise<any[]> {
    return [];
  }
}