import { MigrationInterface, QueryRunner } from "typeorm";

export class mobileFixes21660689738142 implements MigrationInterface {
    name = 'mobileFixes21660689738142'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_settings"
            ADD "banner_color" character varying
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
            ALTER TABLE "user_settings" DROP COLUMN "banner_color"
        `);
    }

}
