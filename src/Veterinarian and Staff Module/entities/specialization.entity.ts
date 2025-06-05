import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Veterinarian } from './veterinarian.entity';

@Entity('specializations')
export class Specialization {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @ManyToMany(() => Veterinarian, vet => vet.specializations)
  veterinarians!: Veterinarian[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
