import { Customer } from '../../customer-pet/entities/customer-pet.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class LoyaltyPoint {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Customer, customer => customer.loyaltyPoints)
  customer!: Customer;

  @Column()
  points!: number;

  @Column()
  type!: 'earn' | 'redeem'; // points earned or spent

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date!: Date;

  @Column({ nullable: true })
  description!: string;
}
