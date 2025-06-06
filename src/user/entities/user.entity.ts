import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Unique,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { UserRole } from '../../common/enums/roles.enum';
import { Review } from '../../review/entities/review.entity';
import { Pet } from '../../customer-pet/entities/pet.entity';

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({
    type: 'varchar',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @OneToMany(() => Pet, pet => pet.owner)
  ownedPets: Pet[];

  @ManyToMany(() => Pet, pet => pet.familyMembers)
  sharedPets: Pet[];

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @OneToMany(() => Review, review => review.user, { eager: true })
  reviews!: Review[];

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
