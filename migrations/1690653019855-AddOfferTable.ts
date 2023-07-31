import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOfferTable1690653019855 implements MigrationInterface {
  name = 'AddOfferTable1690653019855';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "offers"
                             (
                                 "id"                 uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                 "createdAt"          TIMESTAMP         NOT NULL DEFAULT now(),
                                 "updatedAt"          TIMESTAMP         NOT NULL DEFAULT now(),
                                 "deletedAt"          TIMESTAMP,
                                 "name"               character varying NOT NULL,
                                 "discountPercentage" double precision  NOT NULL,
                                 CONSTRAINT "PK_4c88e956195bba85977da21b8f4" PRIMARY KEY ("id")
                             )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "offers"`);
  }
}
