import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Product } from "./product.entity"

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 100 })
  name: string

  @Column({ type: "varchar", length: 255, nullable: true })
  description: string

  @Column({ type: "varchar", length: 100, nullable: true })
  slug: string

  @Column({ type: "uuid", nullable: true })
  parent_id: string

  @Column({ type: "boolean", default: true })
  is_active: boolean

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @OneToMany(
    () => Product,
    (product) => product.category,
  )
  products: Product[]
}
