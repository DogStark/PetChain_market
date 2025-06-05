import { User } from '@/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ReviewResponse } from './response-review.dto';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', width: 1 })
  rating!: number;

  @Column({ default: false })
  approved!: boolean;

  @Column({ default: 0 })
  helpfulVotes!: number;

  @Column({ nullable: true })
  productId?: number;

  @Column({ nullable: true })
  serviceId?: number;

  @Column('text')
  content!: string;

  @ManyToOne(() => User, user => user.reviews)
  user!: User;

  @OneToMany(() => ReviewResponse, response => response.review, {
    cascade: true,
  })
  responses!: ReviewResponse[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
