import { MigrationInterface, QueryRunner } from "typeorm";

export class opencordFixes1660678725589 implements MigrationInterface {
    name = 'opencordFixes1660678725589'

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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
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
            ALTER TABLE "users" DROP COLUMN "premium_usage_flags"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "purchased_flags"
        `);
    }

}
