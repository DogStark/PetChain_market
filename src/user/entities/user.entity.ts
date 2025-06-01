
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Role } from '@/enums/role.enums';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
     id!: string;
     pets: any;
  @Column()
     name!: string;

  @Column({ unique: true })
     email!: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
     role!: Role;

  @CreateDateColumn()
     createdAt!: Date;

  @UpdateDateColumn()
     updatedAt!: Date;
}

export { Role };


