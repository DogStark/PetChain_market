import { Injectable, Logger } from '@nestjs/common';
import { BackupMetadata } from './backup.service';

export interface BackupAlert {
  id: string;
  type: 'failure' | 'warning' | 'success';
  message: string;
  timestamp: Date;
  backupId?: string;
}

@Injectable()
export class BackupMonitoringService {
  private readonly logger = new Logger(BackupMonitoringService.name);
  private alerts: BackupAlert[] = [];

  async recordBackupSuccess(backup: BackupMetadata): Promise<void> {
    const alert: BackupAlert = {
      id: `alert_${Date.now()}`,
      type: 'success',
      message: `Backup completed successfully: ${backup.id} (${this.formatBytes(backup.size)})`,
      timestamp: new Date(),
      backupId: backup.id,
    };

    this.alerts.push(alert);
    this.logger.log(alert.message);
    
    // Send success notification (implement your notification logic)
    await this.sendNotification(alert);
  }

  async recordBackupFailure(backupType: string, errorMessage: string): Promise<void> {
    const alert: BackupAlert = {
      id: `alert_${Date.now()}`,
      type: 'failure',
      message: `Backup failed (${backupType}): ${errorMessage}`,
      timestamp: new Date(),
    };

    this.alerts.push(alert);
    this.logger.error(alert.message);
    
    // Send failure notification (implement your notification logic)
    await this.sendNotification(alert);
  }

  async recordBackupWarning(backupId: string, warningMessage: string): Promise<void> {
    const alert: BackupAlert = {
      id: `alert_${Date.now()}`,
      type: 'warning',
      message: `Backup warning for ${backupId}: ${warningMessage}`,
      timestamp: new Date(),
      backupId,
    };

    this.alerts.push(alert);
    this.logger.warn(alert.message);
    
    // Send warning notification (implement your notification logic)
    await this.sendNotification(alert);
  }

  async getBackupHealth(): Promise<any> {
    // Calculate backup health metrics
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const recentAlerts = this.alerts.filter(alert => alert.timestamp > last24Hours);
    const failures = recentAlerts.filter(alert => alert.type === 'failure').length;
    const warnings = recentAlerts.filter(alert => alert.type === 'warning').length;
    const successes = recentAlerts.filter(alert => alert.type === 'success').length;

    return {
      status: failures > 0 ? 'critical' : warnings > 0 ? 'warning' : 'healthy',
      last24Hours: {
        successes,
        warnings,
        failures,
      },
      lastBackup: recentAlerts
        .filter(alert => alert.type === 'success')
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0],
    };
  }

  private async sendNotification(alert: BackupAlert): Promise<void> {
    // Implement your notification logic here
    // This could send emails, Slack messages, SMS, etc.
    
    switch (alert.type) {
      case 'failure':
        // Send critical alert
        break;
      case 'warning':
        // Send warning alert
        break;
      case 'success':
        // Optional: send success confirmation
        break;
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
