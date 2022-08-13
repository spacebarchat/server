import { MigrationInterface, QueryRunner } from "typeorm";

export class CodeCleanup31660258372154 implements MigrationInterface {
    name = 'CodeCleanup31660258372154'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "settings"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "settings" text NOT NULL
        `);
    }

}
