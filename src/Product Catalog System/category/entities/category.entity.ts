import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true })
  image!: string;

  @ManyToOne(() => Category, category => category.subcategories, {
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent!: Category;

  @OneToMany(() => Category, category => category.parent)
  subcategories!: Category[];

  @OneToMany(() => Product, product => product.category)
  products!: Product[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
