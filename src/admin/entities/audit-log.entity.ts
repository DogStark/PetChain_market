import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  user!: string;

  @Column()
  action!: string;

  @Column({ type: 'timestamp' })
  timestamp!: Date;
}
