import { MigrationInterface, QueryRunner } from "typeorm";

export class ReconcileTypeormModels1783086517091 implements MigrationInterface {
    name = "ReconcileTypeormModels1783086517091";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application_commands" ALTER COLUMN "version" SET DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application_commands" ALTER COLUMN "version" SET DEFAULT (0)`);
    }
}
