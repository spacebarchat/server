import { MigrationInterface, QueryRunner } from "typeorm";

export class guildMemberProfiles1661785263936 implements MigrationInterface {
    name = 'guildMemberProfiles1661785263936'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "connected_accounts" DROP COLUMN "external_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "connected_accounts" DROP COLUMN "integrations"
        `);
        await queryRunner.query(`
            ALTER TABLE "members"
            ADD "avatar" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "members"
            ADD "banner" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "members"
            ADD "bio" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "members"
            ADD "communication_disabled_until" TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE "connected_accounts"
            ALTER COLUMN "access_token"
            SET NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "connected_accounts"
            ALTER COLUMN "access_token" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "members" DROP COLUMN "communication_disabled_until"
        `);
        await queryRunner.query(`
            ALTER TABLE "members" DROP COLUMN "bio"
        `);
        await queryRunner.query(`
            ALTER TABLE "members" DROP COLUMN "banner"
        `);
        await queryRunner.query(`
            ALTER TABLE "members" DROP COLUMN "avatar"
        `);
        await queryRunner.query(`
            ALTER TABLE "connected_accounts"
            ADD "integrations" text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "connected_accounts"
            ADD "external_id" character varying NOT NULL
        `);
    }

}
