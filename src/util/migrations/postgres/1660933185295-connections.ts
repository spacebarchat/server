import { MigrationInterface, QueryRunner } from "typeorm";

export class connections1660933185295 implements MigrationInterface {
    name = 'connections1660933185295'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "connected_accounts"
            ADD "external_id" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "connected_accounts"
            ADD "integrations" text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "connected_accounts"
            ALTER COLUMN "access_token" DROP NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "connected_accounts"
            ALTER COLUMN "access_token"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "connected_accounts" DROP COLUMN "integrations"
        `);
        await queryRunner.query(`
            ALTER TABLE "connected_accounts" DROP COLUMN "external_id"
        `);
    }

}
