import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateInsuranceClaimsTable1678901234569 implements MigrationInterface {
  name = 'CreateInsuranceClaimsTable1678901234569';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'insurance_claims',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'claim_number',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'treatment_date',
            type: 'date',
          },
          {
            name: 'diagnosis',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'treatment_description',
            type: 'text',
          },
          {
            name: 'total_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'approved_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'paid_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'submitted', 'under_review', 'approved', 'denied', 'paid', 'partially_paid'],
            default: "'draft'",
          },
          {
            name: 'denial_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'veterinarian_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'veterinarian_license',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'clinic_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'clinic_address',
            type: 'text',
          },
          {
            name: 'provider_response',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'submitted_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'processed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'policy_id',
            type: 'int',
          },
          {
            name: 'pre_authorization_id',
            type: 'int',
            isNullable: true,
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
      }),
    );    
  }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable('insurance_claims');
    }
  }