import { LoyaltyPoint } from "@/loyalty/entities/loyalty.entity";
import { Referral } from "@/loyalty/entities/referral.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: 'date', nullable: true })
  birthday!: Date;

  @Column({ type: 'date', nullable: true })
  anniversary!: Date;

  @OneToMany(() => LoyaltyPoint, (loyaltyPoint) => loyaltyPoint.customer)
  loyaltyPoints!: LoyaltyPoint[];

  @OneToMany(() => Referral, (referral) => referral.referrer)
  referrals!: Referral[];

  @OneToMany(() => Referral, (referral) => referral.referredCustomer)
  referredBy!: Referral[];
}
