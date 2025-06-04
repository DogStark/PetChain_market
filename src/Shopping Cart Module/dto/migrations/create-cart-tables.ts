import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateCartTables1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create carts table
    await queryRunner.createTable(
      new Table({
        name: 'carts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'sessionId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'totalAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: '0',
          },
          {
            name: 'totalItems',
            type: 'int',
            default: '0',
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Create cart_items table
    await queryRunner.createTable(
      new Table({
        name: 'cart_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'cartId',
            type: 'uuid',
          },
          {
            name: 'productId',
            type: 'uuid',
          },
          {
            name: 'productName',
            type: 'varchar',
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'quantity',
            type: 'int',
            default: '1',
          },
          {
            name: 'subtotal',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['cartId'],
            referencedTableName: 'carts',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'carts',
      new Index('IDX_CART_USER_ID', ['userId']),
    );
    await queryRunner.createIndex(
      'carts',
      new Index('IDX_CART_SESSION_ID', ['sessionId']),
    );
    await queryRunner.createIndex(
      'carts',
      new Index('IDX_CART_EXPIRES_AT', ['expiresAt']),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('cart_items');
    await queryRunner.dropTable('carts');
  }
}
