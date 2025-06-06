import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm"

@Entity("products")
@Index(["name", "description"]) // Composite index for search
@Index(["category_id"]) // Index for category filtering
@Index(["brand"]) // Index for brand filtering
@Index(["price"]) // Index for price filtering
@Index(["created_at"]) // Index for sorting by date
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255 })
  @Index() // Individual index for name searches
  name: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number

  @Column({ type: "varchar", length: 100 })
  brand: string

  @Column({ type: "uuid" })
  category_id: string

  @Column({ type: "varchar", length: 255, nullable: true })
  image_url: string

  @Column({ type: "varchar", length: 50, default: "active" })
  status: string

  @Column({ type: "int", default: 0 })
  stock_quantity: number

  @Column({ type: "varchar", length: 50, nullable: true })
  sku: string

  @Column({ type: "decimal", precision: 3, scale: 2, default: 0 })
  rating: number

  @Column({ type: "int", default: 0 })
  review_count: number

  @Column({ type: "text", array: true, default: "{}" })
  tags: string[]

  // Full-text search vector (PostgreSQL specific)
  @Column({
    type: "tsvector",
    select: false,
    insert: false,
    update: false,
  })
  @Index("products_search_vector_idx", { synchronize: false })
  search_vector: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @ManyToOne("Category", "products")
  @JoinColumn({ name: "category_id" })
  category: any
}
