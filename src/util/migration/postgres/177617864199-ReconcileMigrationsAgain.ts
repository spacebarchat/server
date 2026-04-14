import { MigrationInterface, QueryRunner } from "typeorm";

export class ReconcileMigrationsAgain1776178641999 implements MigrationInterface {
    name = "ReconcileMigrationsAgain1776178641999";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // since we're no longer using syncDb()!
        await queryRunner.query(`ALTER TABLE "webhooks" DROP CONSTRAINT IF EXISTS "fk_d64f38834fa676f6caa4786ddd6"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log("no.");
    }
}
