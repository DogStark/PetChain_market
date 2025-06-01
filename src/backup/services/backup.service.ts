import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface BackupConfig {
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  backupPath: string;
  retentionDays: number;
  compressionLevel: number;
}

export interface BackupMetadata {
  id: string;
  timestamp: Date;
  type: 'full' | 'incremental';
  size: number;
  checksum: string;
  status: 'success' | 'failed' | 'in_progress';
  duration: number;
  filePath: string;
  errorMessage?: string;
}

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly config: BackupConfig;

  constructor(configService: ConfigService) {
    this.config = {
      dbHost: configService.get('DB_HOST', 'localhost'),
      dbPort: configService.get('DB_PORT', 5432),
      dbName: configService.get('DB_NAME', 'petchain'),
      dbUser: configService.get('DB_USER', 'postgres'),
      dbPassword: configService.get('DB_PASSWORD', ''),
      backupPath: configService.get('BACKUP_PATH', './backups'),
      retentionDays: configService.get('BACKUP_RETENTION_DAYS', 30),
      compressionLevel: configService.get('BACKUP_COMPRESSION_LEVEL', 6),
    };
  }

  async createFullBackup(): Promise<BackupMetadata> {
    const backupId = this.generateBackupId();
    const timestamp = new Date();
    const fileName = `petchain_full_${timestamp.toISOString().replace(/[:.]/g, '-')}.sql.gz`;
    const filePath = path.join(this.config.backupPath, fileName);

    this.logger.log(`Starting full backup: ${backupId}`);
    const startTime = Date.now();

    try {
      await fs.mkdir(this.config.backupPath, { recursive: true });

      const dumpCommand = `pg_dump -h ${this.config.dbHost} -p ${this.config.dbPort} -U ${this.config.dbUser} -d ${this.config.dbName} --verbose --clean --no-owner --no-privileges | gzip -${this.config.compressionLevel} > ${filePath}`;
      
      await execAsync(dumpCommand, {
        env: { ...process.env, PGPASSWORD: this.config.dbPassword },
      });

      const stats = await fs.stat(filePath);
      const checksum = await this.calculateChecksum(filePath);
      const duration = Date.now() - startTime;

      const metadata: BackupMetadata = {
        id: backupId,
        timestamp,
        type: 'full',
        size: stats.size,
        checksum,
        status: 'success',
        duration,
        filePath,
      };

      await this.saveBackupMetadata(metadata);
      this.logger.log(`Full backup completed successfully: ${backupId} (${this.formatBytes(stats.size)})`);

      return metadata;
    } catch (error) {
      const duration = Date.now() - startTime;
      const metadata: BackupMetadata = {
        id: backupId,
        timestamp,
        type: 'full',
        size: 0,
        checksum: '',
        status: 'failed',
        duration,
        filePath,
        errorMessage: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error),
      };

      await this.saveBackupMetadata(metadata);
      this.logger.error(`Full backup failed: ${backupId}`, error);
      throw error;
    }
  }

  async createIncrementalBackup(lastBackupTime: Date): Promise<BackupMetadata> {
    const backupId = this.generateBackupId();
    const timestamp = new Date();
    const fileName = `petchain_incremental_${timestamp.toISOString().replace(/[:.]/g, '-')}.sql.gz`;
    const filePath = path.join(this.config.backupPath, fileName);

    this.logger.log(`Starting incremental backup: ${backupId}`);
    const startTime = Date.now();

    try {
      await fs.mkdir(this.config.backupPath, { recursive: true });

      const incrementalCommand = `pg_dump -h ${this.config.dbHost} -p ${this.config.dbPort} -U ${this.config.dbUser} -d ${this.config.dbName} --verbose --clean --no-owner --no-privileges --where="updated_at > '${lastBackupTime.toISOString()}'" | gzip -${this.config.compressionLevel} > ${filePath}`;

      await execAsync(incrementalCommand, {
        env: { ...process.env, PGPASSWORD: this.config.dbPassword },
      });

      const stats = await fs.stat(filePath);
      const checksum = await this.calculateChecksum(filePath);
      const duration = Date.now() - startTime;

      const metadata: BackupMetadata = {
        id: backupId,
        timestamp,
        type: 'incremental',
        size: stats.size,
        checksum,
        status: 'success',
        duration,
        filePath,
      };

      await this.saveBackupMetadata(metadata);
      this.logger.log(`Incremental backup completed: ${backupId} (${this.formatBytes(stats.size)})`);

      return metadata;
    } catch (error) {
      const duration = Date.now() - startTime;
      const metadata: BackupMetadata = {
        id: backupId,
        timestamp,
        type: 'incremental',
        size: 0,
        checksum: '',
        status: 'failed',
        duration,
        filePath,
        errorMessage: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error),
      };

      await this.saveBackupMetadata(metadata);
      this.logger.error(`Incremental backup failed: ${backupId}`, error);
      throw error;
    }
  }

  async verifyBackupIntegrity(backupId: string): Promise<boolean> {
    try {
      const metadata = await this.getBackupMetadata(backupId);
      if (!metadata) {
        this.logger.error(`Backup metadata not found: ${backupId}`);
        return false;
      }

      const fileExists = await fs.access(metadata.filePath).then(() => true).catch(() => false);
      if (!fileExists) {
        this.logger.error(`Backup file not found: ${metadata.filePath}`);
        return false;
      }

      const currentChecksum = await this.calculateChecksum(metadata.filePath);
      if (currentChecksum !== metadata.checksum) {
        this.logger.error(`Backup integrity check failed: checksum mismatch for ${backupId}`);
        return false;
      }

      const testResult = await this.testBackupRestore(metadata.filePath);
      if (!testResult) {
        this.logger.error(`Backup restore test failed: ${backupId}`);
        return false;
      }

      this.logger.log(`Backup integrity verified: ${backupId}`);
      return true;
    } catch (error) {
      this.logger.error(`Backup integrity verification failed: ${backupId}`, error);
      return false;
    }
  }

  async cleanupOldBackups(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

      const backups = await this.getAllBackupMetadata();
      const oldBackups = backups.filter(backup => backup.timestamp < cutoffDate);

      for (const backup of oldBackups) {
        try {
          await fs.unlink(backup.filePath);
          await this.deleteBackupMetadata(backup.id);
          this.logger.log(`Deleted old backup: ${backup.id}`);
        } catch (error) {
          this.logger.error(`Failed to delete backup: ${backup.id}`, error);
        }
      }

      this.logger.log(`Cleaned up ${oldBackups.length} old backups`);
    } catch (error) {
      this.logger.error('Failed to cleanup old backups', error);
    }
  }

  private generateBackupId(): string {
    return `backup_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  private async testBackupRestore(backupPath: string): Promise<boolean> {
    try {
      const testDbName = `petchain_test_${Date.now()}`;
      
      await execAsync(`createdb -h ${this.config.dbHost} -p ${this.config.dbPort} -U ${this.config.dbUser} ${testDbName}`, {
        env: { ...process.env, PGPASSWORD: this.config.dbPassword },
      });

      await execAsync(`gunzip -c ${backupPath} | psql -h ${this.config.dbHost} -p ${this.config.dbPort} -U ${this.config.dbUser} -d ${testDbName}`, {
        env: { ...process.env, PGPASSWORD: this.config.dbPassword },
      });

      await execAsync(`dropdb -h ${this.config.dbHost} -p ${this.config.dbPort} -U ${this.config.dbUser} ${testDbName}`, {
        env: { ...process.env, PGPASSWORD: this.config.dbPassword },
      });

      return true;
    } catch (error) {
      this.logger.error('Backup restore test failed', error);
      return false;
    }
  }

  private async saveBackupMetadata(metadata: BackupMetadata): Promise<void> {
    const metadataPath = path.join(this.config.backupPath, 'metadata.json');
    
    try {
      let metadataList: BackupMetadata[] = [];
      
      try {
        const existingData = await fs.readFile(metadataPath, 'utf-8');
        metadataList = JSON.parse(existingData);
      } catch (error) {
      }

      metadataList.push(metadata);
      await fs.writeFile(metadataPath, JSON.stringify(metadataList, null, 2));
    } catch (error) {
      this.logger.error('Failed to save backup metadata', error);
    }
  }

  private async getBackupMetadata(backupId: string): Promise<BackupMetadata | null> {
    const metadataPath = path.join(this.config.backupPath, 'metadata.json');
    
    try {
      const data = await fs.readFile(metadataPath, 'utf-8');
      const metadataList: BackupMetadata[] = JSON.parse(data);
      return metadataList.find(metadata => metadata.id === backupId) || null;
    } catch (error) {
      return null;
    }
  }

  private async getAllBackupMetadata(): Promise<BackupMetadata[]> {
    const metadataPath = path.join(this.config.backupPath, 'metadata.json');
    
    try {
      const data = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  private async deleteBackupMetadata(backupId: string): Promise<void> {
    const metadataPath = path.join(this.config.backupPath, 'metadata.json');
    
    try {
      const data = await fs.readFile(metadataPath, 'utf-8');
      const metadataList: BackupMetadata[] = JSON.parse(data);
      const updatedList = metadataList.filter(metadata => metadata.id !== backupId);
      await fs.writeFile(metadataPath, JSON.stringify(updatedList, null, 2));
    } catch (error) {
      this.logger.error('Failed to delete backup metadata', error);
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