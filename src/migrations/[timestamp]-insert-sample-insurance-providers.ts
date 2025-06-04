import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertSampleInsuranceProviders1678901234572 implements MigrationInterface {
  name = 'InsertSampleInsuranceProviders1678901234572';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO insurance_providers (name, code, api_endpoint, api_key, configuration, is_active) VALUES
      ('PetPlan', 'PETPLAN', 'https://api.petplan.com/v1', 'petplan_api_key_here', '{"supports_direct_pay": true, "processing_days": 5}', true),
      ('Trupanion', 'TRUPANION', 'https://api.trupanion.com/v2', 'trupanion_api_key_here', '{"supports_direct_pay": true, "processing_days": 1}', true),
      ('Nationwide', 'NATIONWIDE', 'https://api.nationwide.com/pet', 'nationwide_api_key_here', '{"supports_direct_pay": false, "processing_days": 7}', true),
      ('ASPCA Pet Health Insurance', 'ASPCA', 'https://api.aspcapetinsurance.com', 'aspca_api_key_here', '{"supports_direct_pay": false, "processing_days": 10}', true),
      ('Embrace Pet Insurance', 'EMBRACE', 'https://api.embracepetinsurance.com', 'embrace_api_key_here', '{"supports_direct_pay": false, "processing_days": 8}', true)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM insurance_providers WHERE code IN ('PETPLAN', 'TRUPANION', 'NATIONWIDE', 'ASPCA', 'EMBRACE')`);
  }
}
