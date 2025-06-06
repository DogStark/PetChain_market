import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"

@Entity("search_suggestions")
@Index(["query"]) // Index for quick suggestion lookups
@Index(["search_count"]) // Index for popularity sorting
export class SearchSuggestion {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255 })
  query: string

  @Column({ type: "int", default: 1 })
  search_count: number

  @Column({ type: "int", default: 0 })
  result_count: number

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
