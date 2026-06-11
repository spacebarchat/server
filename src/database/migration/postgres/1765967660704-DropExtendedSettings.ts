import { MigrationInterface, QueryRunner } from "typeorm";

export class DropExtendedSettings1765967660704 implements MigrationInterface {
    name = "DropExtendedSettings1765967660704";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "extended_settings"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "extended_settings" text NOT NULL`);
    }
}
