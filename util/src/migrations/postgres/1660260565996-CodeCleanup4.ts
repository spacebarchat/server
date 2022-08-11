import { MigrationInterface, QueryRunner } from "typeorm";

export class CodeCleanup41660260565996 implements MigrationInterface {
    name = 'CodeCleanup41660260565996'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "settingsId" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "UQ_76ba283779c8441fd5ff819c8cf" UNIQUE ("settingsId")
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_76ba283779c8441fd5ff819c8cf" FOREIGN KEY ("settingsId") REFERENCES "user_settings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_76ba283779c8441fd5ff819c8cf"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "UQ_76ba283779c8441fd5ff819c8cf"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "settingsId"
        `);
    }

}
