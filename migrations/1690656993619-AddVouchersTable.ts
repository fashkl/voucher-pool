import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVouchersTable1690656993619 implements MigrationInterface {
  name = 'AddVouchersTable1690656993619';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "vouchers"
                             (
                                 "id"         uuid                  NOT NULL DEFAULT uuid_generate_v4(),
                                 "createdAt"  TIMESTAMP             NOT NULL DEFAULT now(),
                                 "updatedAt"  TIMESTAMP             NOT NULL DEFAULT now(),
                                 "deletedAt"  TIMESTAMP,
                                 "code"       character varying(16) NOT NULL,
                                 "expireAt"   TIMESTAMP,
                                 "redeemedAt" date,
                                 "customerId" uuid,
                                 "offerId"    uuid,
                                 CONSTRAINT "PK_ed1b7dd909a696560763acdbc04" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_808b4ab849a63454c2bf053e10" ON "vouchers" ("customerId", "offerId", "code") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_efc30b2b9169e05e0e1e19d6dd" ON "vouchers" ("code") `,
    );
    await queryRunner.query(`ALTER TABLE "vouchers"
        ADD CONSTRAINT "FK_382472ec961c3f80aefb8c24a0c" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "vouchers"
        ADD CONSTRAINT "FK_d82da7afdfd8005eccce475d1b8" FOREIGN KEY ("offerId") REFERENCES "offers" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vouchers"
        DROP CONSTRAINT "FK_d82da7afdfd8005eccce475d1b8"`);
    await queryRunner.query(`ALTER TABLE "vouchers"
        DROP CONSTRAINT "FK_382472ec961c3f80aefb8c24a0c"`);
    await queryRunner.query(`DROP TABLE "vouchers"`);
  }
}
