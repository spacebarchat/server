import { MigrationInterface, QueryRunner } from "typeorm";

export class mobileFixes1661435431844 implements MigrationInterface {
    name = 'mobileFixes1661435431844'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "purchased_flags" integer NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "premium_usage_flags" integer NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ADD "banner_color" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ADD "friend_discovery_flags" integer NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ADD "view_nsfw_guilds" boolean NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ADD "passwordless" boolean NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "mfa_enabled"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "channels"
            ALTER COLUMN "nsfw"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "guilds"
            ALTER COLUMN "nsfw"
            SET NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "guilds"
            ALTER COLUMN "nsfw" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "channels"
            ALTER COLUMN "nsfw" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "mfa_enabled" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings" DROP COLUMN "passwordless"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings" DROP COLUMN "view_nsfw_guilds"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings" DROP COLUMN "friend_discovery_flags"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_settings" DROP COLUMN "banner_color"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "premium_usage_flags"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "purchased_flags"
        `);
    }

}
