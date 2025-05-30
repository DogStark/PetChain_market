import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { MedicalRecord } from '@/pets/entities/medical_record.entity';

@Entity('pets')
export class Pet extends BaseEntity {
  @Column()
  name: string | undefined;

  @Column()
  breed: string | undefined;

  @Column()
  age: number | undefined;

  @Column({ nullable: true })
  description: string | undefined;

  @Column()
  ownerId: string | undefined;

  @ManyToOne(() => User, user => user.pets, { 
    lazy: true,
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'ownerId' })
  owner: Promise<User> | undefined;

  @OneToMany(() => MedicalRecord, record => record.pet, { 
    lazy: true,
    cascade: true
  })
  medicalRecords: Promise<MedicalRecord[]> | undefined;

  getOwnerSync(): User | null {
    return (this.owner as any)?.__entity__ || null;
  }

  isOwnerLoaded(): boolean {
    return (this.owner as any)?.__loaded__ === true;
  }
}