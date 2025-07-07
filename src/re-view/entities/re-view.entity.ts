import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('re-view')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  productId: string;

  @Column()
  content: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ default: false })
  approved: boolean;

  @Column({ default: 0 })
  helpfulCount: number;

  @Column({ nullable: true })
  response: string;

  @CreateDateColumn()
  createdAt: Date;
}

