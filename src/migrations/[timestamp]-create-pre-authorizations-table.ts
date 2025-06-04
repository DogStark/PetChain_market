import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreatePreAuthorizationsTable1678901234570 implements MigrationInterface {
  name = 'CreatePreAuthorizationsTable1678901234570';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pre_authorizations',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'authorization_number',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'treatment_type',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'treatment_description',
            type: 'text',
          },
          {
            name: 'estimated_cost',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'authorized_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'approved', 'denied', 'expired'],
            default: "'pending'",
          },
          {
            name: 'expiration_date',
            type: 'date',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'provider_response',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'policy_id',
            type: 'int',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['policy_id'],
            referencedTableName: 'insurance_policies',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'pre_authorizations',
      new Index('IDX_PRE_AUTHORIZATIONS_POLICY', ['policy_id']),
    );

    await queryRunner.createIndex(
      'pre_authorizations',
      new Index('IDX_PRE_AUTHORIZATIONS_STATUS', ['status']),
    );

    await queryRunner.createIndex(
      'pre_authorizations',
      new Index('IDX_PRE_AUTHORIZATIONS_EXPIRATION', ['expiration_date']),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pre_authorizations');
  }
}
