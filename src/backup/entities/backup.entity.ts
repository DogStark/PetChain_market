import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('backups')
export class BackupEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string | undefined;

  @Column()
  backupId: string | undefined;

  @Column()
  type: string | undefined;

  @Column()
  status: string | undefined;

  @Column('bigint')
  size: number | undefined;

  @Column()
  checksum: string | undefined;

  @Column()
  filePath: string | undefined;

  @Column('int')
  duration: number | undefined;

  @Column({ nullable: true })
  errorMessage?: string | null;

  @CreateDateColumn()
  createdAt: Date | undefined;
}

