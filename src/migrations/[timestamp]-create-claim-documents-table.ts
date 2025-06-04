import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateClaimDocumentsTable1678901234571 implements MigrationInterface {
  name = 'CreateClaimDocumentsTable1678901234571';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'claim_documents',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'file_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'original_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'file_size',
            type: 'int',
          },
          {
            name: 'file_path',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'document_type',
            type: 'enum',
            enum: ['invoice', 'medical_record', 'prescription', 'lab_result', 'other'],
          },
          {
            name: 'uploaded_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'claim_id',
            type: 'int',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['claim_id'],
            referencedTableName: 'insurance_claims',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'claim_documents',
      new Index('IDX_CLAIM_DOCUMENTS_CLAIM', ['claim_id']),
    );

    await queryRunner.createIndex(
      'claim_documents',
      new Index('IDX_CLAIM_DOCUMENTS_TYPE', ['document_type']),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('claim_documents');
  }
}
