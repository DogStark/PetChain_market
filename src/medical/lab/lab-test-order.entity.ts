import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class LabTestOrder {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  petId!: number;

  @Column()
  orderedByUserId!: number;

  @Column()
  testType!: string;

  @Column({ default: 'pending' })
  status!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  orderedAt!: Date;

  @Column({ nullable: true })
  notes!: string;

  constructor() {
    this.status = 'pending';
    this.orderedAt = new Date();
  }
} 