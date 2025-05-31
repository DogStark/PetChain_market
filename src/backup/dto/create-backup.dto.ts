export class CreateBackupDto {
  type: 'full' | 'incremental' | undefined;
  lastBackupTime?: Date;
  description?: string;
}

export class RecoveryDto {
  backupId: string | undefined;
  targetDatabase?: string;
  pointInTime?: Date;
  verifyBeforeRestore?: boolean;
  createBackupBeforeRestore?: boolean;
}
