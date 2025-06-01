import { Controller, Post, Get, Param, Body, Logger } from '@nestjs/common';
import { BackupService } from '../services/backup.service';
import { RecoveryService, RecoveryOptions } from '../services/recovery.service';
import { BackupMonitoringService } from '../services/backup-monitoring.service';

@Controller('backup')
export class BackupController {
  private readonly logger = new Logger(BackupController.name);

  constructor(
    private readonly backupService: BackupService,
    private readonly recoveryService: RecoveryService,
    private readonly monitoringService: BackupMonitoringService,
  ) {}

  @Post('full')
  async createFullBackup() {
    try {
      const backup = await this.backupService.createFullBackup();
      return { success: true, backup };
    } catch (error) {
      this.logger.error('Full backup failed', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  @Post('incremental')
  async createIncrementalBackup(@Body() body: { lastBackupTime: string }) {
    try {
      const lastBackupTime = new Date(body.lastBackupTime);
      const backup = await this.backupService.createIncrementalBackup(lastBackupTime);
      return { success: true, backup };
    } catch (error) {
      this.logger.error('Incremental backup failed', error);
      return { success: false,  error: error instanceof Error ? error.message : String(error) };
    }
  }

  @Post('verify/:backupId')
  async verifyBackup(@Param('backupId') backupId: string) {
    try {
      const isValid = await this.backupService.verifyBackupIntegrity(backupId);
      return { success: true, isValid, backupId };
    } catch (error) {
      this.logger.error(`Backup verification failed: ${backupId}`, error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  @Post('recover')
  async performRecovery(@Body() options: RecoveryOptions) {
    try {
      const result = await this.recoveryService.performRecovery(options);
      return { success: true, result };
    } catch (error) {
      this.logger.error('Recovery failed', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  @Post('test-recovery/:backupId')
  async testRecovery(@Param('backupId') backupId: string) {
    try {
      const isSuccessful = await this.recoveryService.testRecovery(backupId);
      return { success: true, testPassed: isSuccessful, backupId };
    } catch (error) {
      this.logger.error(`Recovery test failed: ${backupId}`, error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  @Post('cleanup')
  async cleanupOldBackups() {
    try {
      await this.backupService.cleanupOldBackups();
      return { success: true, message: 'Old backups cleaned up successfully' };
    } catch (error) {
      this.logger.error('Backup cleanup failed', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  @Get('health')
  async getBackupHealth() {
    try {
      const health = await this.monitoringService.getBackupHealth();
      return { success: true, health };
    } catch (error) {
      this.logger.error('Failed to get backup health', error);
      return { success: false, error: error instanceof Error ? error.message : String(error)};
    }
  }

  @Get('list')
  async listBackups() {
    try {
      // This would typically query your backup metadata storage
      return { success: true, message: 'Backup list endpoint - implement based on your metadata storage' };
    } catch (error) {
      this.logger.error('Failed to list backups', error);
      return { success: false,  error: error instanceof Error ? error.message : String(error)};
    }
  }
}