import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceIndexes1234567890 implements MigrationInterface {
  name = 'AddPerformanceIndexes1234567890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Pet table indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_pet_owner_id_created_at" ON "pets" ("ownerId", "createdAt");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_pet_breed_age" ON "pets" ("breed", "age");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_pet_name_search" ON "pets" USING gin(to_tsvector('english', "name"));
    `);

    // User table indexes
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_user_email_unique" ON "users" ("email") WHERE "deletedAt" IS NULL;
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_user_created_at" ON "users" ("createdAt");
    `);

    // Medical records indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_medical_record_pet_date" ON "medical_records" ("petId", "visitDate");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_medical_record_veterinarian" ON "medical_records" ("veterinarianId");
    `);

    // Shopping cart indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_shopping_cart_user_status" ON "shopping_carts" ("userId", "status");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_shopping_cart_updated_at" ON "shopping_carts" ("updatedAt");
    `);

    // Inventory indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_inventory_item_category_stock" ON "inventory_items" ("category", "currentStock");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_inventory_item_name_search" ON "inventory_items" USING gin(to_tsvector('english', "name"));
    `);

    // Stock movement indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_stock_movement_item_date" ON "stock_movements" ("inventoryItemId", "createdAt");
    `);

    // Emergency indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_emergency_status_priority" ON "emergencies" ("status", "priority");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_emergency_created_at" ON "emergencies" ("createdAt");
    `);

    // Telemedicine indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_telemedicine_status_date" ON "telemedicine_sessions" ("status", "scheduledAt");
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_telemedicine_patient_vet" ON "telemedicine_sessions" ("petId", "veterinarianId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all created indexes
    const indexes = [
      'IDX_pet_owner_id_created_at',
      'IDX_pet_breed_age',
      'IDX_pet_name_search',
      'IDX_user_email_unique',
      'IDX_user_created_at',
      'IDX_medical_record_pet_date',
      'IDX_medical_record_veterinarian',
      'IDX_shopping_cart_user_status',
      'IDX_shopping_cart_updated_at',
      'IDX_inventory_item_category_stock',
      'IDX_inventory_item_name_search',
      'IDX_stock_movement_item_date',
      'IDX_emergency_status_priority',
      'IDX_emergency_created_at',
      'IDX_telemedicine_status_date',
      'IDX_telemedicine_patient_vet'
    ];

    for (const index of indexes) {
      await queryRunner.query(`DROP INDEX "${index}"`);
    }
  }
}