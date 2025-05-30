import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import { BackupService } from './backup.service';

const execAsync = promisify(exec);

export interface RecoveryOptions {
  backupId: string;
  targetDatabase?: string;
  pointInTime?: Date;
  verifyBeforeRestore?: boolean;
  createBackupBeforeRestore?: boolean;
}

export interface RecoveryResult {
  success: boolean;
  duration: number;
  backupId: string;
  targetDatabase: string;
  errorMessage?: string | undefined;
  preRestoreBackupId?: string | undefined;
}

@Injectable()
export class RecoveryService {
  private readonly logger = new Logger(RecoveryService.name);

  constructor(
    private configService: ConfigService,
    private backupService: BackupService,
  ) {}

  async performRecovery(options: RecoveryOptions): Promise<RecoveryResult> {
    const startTime = Date.now();
    const targetDb = options.targetDatabase ?? this.configService.get<string>('DB_NAME') ?? '';
    
    this.logger.log(`Starting recovery process for backup: ${options.backupId}`);

    try {
      if (options.verifyBeforeRestore) {
        this.logger.log('Verifying backup integrity...');
        const isValid = await this.backupService.verifyBackupIntegrity(options.backupId);
        if (!isValid) {
          throw new Error('Backup integrity verification failed');
        }
      }

      let preRestoreBackupId: string | undefined;
      if (options.createBackupBeforeRestore) {
        this.logger.log('Creating pre-restore backup...');
        const preRestoreBackup = await this.backupService.createFullBackup();
        preRestoreBackupId = preRestoreBackup.id;
      }

      const backupMetadata = await this.getBackupMetadata(options.backupId);
      if (!backupMetadata) {
        throw new Error(`Backup metadata not found: ${options.backupId}`);
      }

      await this.executeRestore(backupMetadata.filePath, targetDb);

      const duration = Date.now() - startTime;
      const result: RecoveryResult = {
        success: true,
        duration,
        backupId: options.backupId,
        targetDatabase: targetDb,
        preRestoreBackupId,
      };

      this.logger.log(`Recovery completed successfully in ${duration}ms`);
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const result: RecoveryResult = {
        success: false,
        duration,
        backupId: options.backupId,
        targetDatabase: targetDb,
        errorMessage,
      };

      this.logger.error(`Recovery failed: ${errorMessage}`);
      return result;
    }
  }

  async testRecovery(backupId: string): Promise<boolean> {
    this.logger.log(`Testing recovery for backup: ${backupId}`);

    try {
      const backupMetadata = await this.getBackupMetadata(backupId);
      if (!backupMetadata) {
        this.logger.error(`Backup metadata not found: ${backupId}`);
        return false;
      }

      const testDbName = `petchain_recovery_test_${Date.now()}`;
      
      try {
        await execAsync(`createdb -h ${this.configService.get('DB_HOST')} -p ${this.configService.get('DB_PORT')} -U ${this.configService.get('DB_USER')} ${testDbName}`, {
          env: { ...process.env, PGPASSWORD: this.configService.get('DB_PASSWORD') },
        });

        await this.executeRestore(backupMetadata.filePath, testDbName);

        await this.verifyRestoredData(testDbName);

        this.logger.log(`Recovery test successful for backup: ${backupId}`);
        return true;

      } finally {
        try {
          await execAsync(`dropdb -h ${this.configService.get('DB_HOST')} -p ${this.configService.get('DB_PORT')} -U ${this.configService.get('DB_USER')} ${testDbName}`, {
            env: { ...process.env, PGPASSWORD: this.configService.get('DB_PASSWORD') },
          });
        } catch (cleanupError) {
          this.logger.warn(`Failed to cleanup test database: ${testDbName}`);
        }
      }

    } catch (error) {
      this.logger.error(`Recovery test failed for backup: ${backupId}`, error);
      return false;
    }
  }

  private async executeRestore(backupFilePath: string, targetDatabase: string): Promise<void> {
    const dbConfig = {
      host: this.configService.get('DB_HOST'),
      port: this.configService.get('DB_PORT'),
      user: this.configService.get('DB_USER'),
      password: this.configService.get('DB_PASSWORD'),
    };

    await execAsync(`psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${targetDatabase}' AND pid <> pg_backend_pid();"`, {
      env: { ...process.env, PGPASSWORD: dbConfig.password },
    });

    const restoreCommand = `gunzip -c ${backupFilePath} | psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${targetDatabase}`;
    
    await execAsync(restoreCommand, {
      env: { ...process.env, PGPASSWORD: dbConfig.password },
    });
  }

  private async verifyRestoredData(database: string): Promise<void> {
    const dbConfig = {
      host: this.configService.get('DB_HOST'),
      port: this.configService.get('DB_PORT'),
      user: this.configService.get('DB_USER'),
      password: this.configService.get('DB_PASSWORD'),
    };

    const verificationQueries = [
      "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'",
      "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public'",
    ];

    for (const query of verificationQueries) {
      await execAsync(`psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${database} -c "${query}"`, {
        env: { ...process.env, PGPASSWORD: dbConfig.password },
      });
    }
  }

  private async getBackupMetadata(backupId: string): Promise<any> {
    return {
      id: backupId,
      filePath: `/path/to/backup/${backupId}.sql.gz`,
      timestamp: new Date(),
      type: 'full',
    };
  }
}