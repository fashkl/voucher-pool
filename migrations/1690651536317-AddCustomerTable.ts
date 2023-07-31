import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomerTable1690651536317 implements MigrationInterface {
  name = 'AddCustomerTable1690651536317';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "customers"
                             (
                                 "id"        uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                 "createdAt" TIMESTAMP         NOT NULL DEFAULT now(),
                                 "updatedAt" TIMESTAMP         NOT NULL DEFAULT now(),
                                 "deletedAt" TIMESTAMP,
                                 "name"      character varying NOT NULL,
                                 "email"     character varying NOT NULL,
                                 CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8536b8b85c06969f84f0c098b0" ON "customers" ("email") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_8536b8b85c06969f84f0c098b0"`);
    await queryRunner.query(`DROP TABLE "customers"`);
  }
}
