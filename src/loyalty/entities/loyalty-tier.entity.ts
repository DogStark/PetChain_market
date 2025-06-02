import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class LoyaltyTier {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string; // Silver, Gold, etc.

  @Column()
  minPoints!: number;
  
  @Column()
  benefits!: string; 
}
