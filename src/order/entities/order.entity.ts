import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column('jsonb')
  items!: Array<{ productId: string; quantity: number; price: number }>;

  @Column('decimal')
  total!: number;

  @Column({ default: 'pending' })
  status!: string;

  @Column({ nullable: true })
  paymentId?: string;

  @Column({ nullable: true })
  paymentStatus?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
