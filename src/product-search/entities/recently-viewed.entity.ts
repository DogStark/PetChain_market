import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm"
import { Product } from "./product.entity"

@Entity("recently_viewed_products")
@Index(["user_id", "viewed_at"]) // Composite index for user queries
@Index(["product_id"]) // Index for product lookups
export class RecentlyViewedProduct {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  user_id: string

  @Column({ type: "uuid" })
  product_id: string

  @CreateDateColumn()
  viewed_at: Date

  @ManyToOne(() => Product)
  @JoinColumn({ name: "product_id" })
  product: Product
}
