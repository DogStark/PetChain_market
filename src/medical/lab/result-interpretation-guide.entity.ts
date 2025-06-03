import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ResultInterpretationGuide {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  testType!: string;

  @Column({ type: 'text' })
  guideText!: string;

  constructor() {
    // Initialize if needed
  }
} 