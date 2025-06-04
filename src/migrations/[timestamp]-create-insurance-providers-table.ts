import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateInsuranceProvidersTable1678901234567 implements MigrationInterface {
  name = 'CreateInsuranceProvidersTable1678901234567';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'insurance_providers',
        columns: [
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
          {
            columnNames: ['pre_authorization_id'],
            referencedTableName: 'pre_authorizations',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'insurance_claims',
      new Index('IDX_INSURANCE_CLAIMS_POLICY', ['policy_id']),
    );

    await queryRunner.createIndex(
      'insurance_claims',
      new Index('IDX_INSURANCE_CLAIMS_STATUS', ['status']),
    );

    await queryRunner.createIndex(
      'insurance_claims',
      new Index('IDX_INSURANCE_CLAIMS_TREATMENT_DATE', ['treatment_date']),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('insurance_claims');
  }
}