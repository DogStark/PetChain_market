import { MigrationInterface, QueryRunner, Table, ForeignKey } from 'typeorm';

export class CreateVaccinationTables1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'vaccination_templates',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'species',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'vaccinations',
            type: 'json',
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    // Create vaccination_records table
    await queryRunner.createTable(
      new Table({
        name: 'vaccination_records',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'petId',
            type: 'uuid',
          },
          {
            name: 'vaccineName',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'vaccineType',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'manufacturer',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'batchNumber',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'administeredDate',
            type: 'date',
          },
          {
            name: 'nextDueDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'veterinarianName',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'clinicName',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'sideEffects',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    // Create vaccination_schedules table
    await queryRunner.createTable(
      new Table({
        name: 'vaccination_schedules',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'petId',
            type: 'uuid',
          },
          {
            name: 'vaccineName',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'vaccineType',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'scheduledDate',
            type: 'date',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['scheduled', 'completed', 'overdue', 'cancelled'],
            default: "'scheduled'",
          },
          {
            name: 'reminderSent',
            type: 'boolean',
            isNullable: true,
            default: false,
          },
          {
            name: 'reminderSentAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_vaccination_records_pet_id" ON "vaccination_records" ("petId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_vaccination_records_administered_date" ON "vaccination_records" ("administeredDate")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_vaccination_schedules_pet_id" ON "vaccination_schedules" ("petId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_vaccination_schedules_scheduled_date" ON "vaccination_schedules" ("scheduledDate")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_vaccination_schedules_status" ON "vaccination_schedules" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('vaccination_schedules');
    await queryRunner.dropTable('vaccination_records');
    await queryRunner.dropTable('vaccination_templates');
  }
}