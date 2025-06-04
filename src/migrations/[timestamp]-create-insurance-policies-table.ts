import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateInsurancePoliciesTable1678901234568 implements MigrationInterface {
  name = 'CreateInsurancePoliciesTable1678901234568';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'insurance_policies',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'policy_number',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'holder_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'holder_email',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'holder_phone',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'deductible',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'coverage_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
          {
            name: 'annual_limit',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'effective_date',
            type: 'date',
          },
          {
            name: 'expiration_date',
            type: 'date',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'suspended', 'cancelled', 'expired'],
            default: "'active'",
          },
          {
            name: 'provider_id',
            type: 'int',
          },
          {
            name: 'pet_id',
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
            columnNames: ['provider_id'],
            referencedTableName: 'insurance_providers',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['pet_id'],
            referencedTableName: 'pets',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'insurance_policies',
      new Index('IDX_INSURANCE_POLICIES_PROVIDER', ['provider_id']),
    );

    await queryRunner.createIndex(
      'insurance_policies',
      new Index('IDX_INSURANCE_POLICIES_PET', ['pet_id']),
    );

    await queryRunner.createIndex(
      'insurance_policies',
      new Index('IDX_INSURANCE_POLICIES_STATUS', ['status']),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('insurance_policies');
  }
}
