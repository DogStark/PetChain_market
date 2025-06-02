import { Customer } from "@/customer/pet/entities/pet.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Referral {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Customer, (customer) => customer.referrals)
  referrer!: Customer;

  @ManyToOne(() => Customer)
  referredCustomer!: Customer;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date!: Date;

  @Column({ default: false })
  bonusGiven!: boolean;
}
