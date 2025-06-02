import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Review } from "./review.entity";
import { User } from "@/user/entities/user.entity";

@Entity()
export class ReviewResponse {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  message!: string;

  @ManyToOne(() => Review, (review) => review.responses)
  review!: Review;

  @ManyToOne(() => User)
  responder!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
