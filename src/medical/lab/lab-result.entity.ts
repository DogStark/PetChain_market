import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { LabTestOrder } from './lab-test-order.entity';

@Entity()
export class LabResult {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  orderId!: number;

  @Column({ type: 'json' })
  resultData!: any;

  @Column()
  uploadedByUserId!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploadedAt!: Date;

  @Column({ nullable: true })
  interpretation!: string;

  @Column({ nullable: true })
  reportUrl!: string;

  @ManyToOne(() => LabTestOrder)
  @JoinColumn({ name: 'orderId' })
  order!: LabTestOrder;

  constructor() {
    this.uploadedAt = new Date();
  }
} 