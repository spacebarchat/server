import { MigrationInterface, QueryRunner } from "typeorm";

export class ApplicationEmojis1782839999040 implements MigrationInterface {
    name = "ApplicationEmojis1782839999040";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "emojis" ADD "application_id" bigint`);
        await queryRunner.query(`ALTER TABLE "emojis" DROP CONSTRAINT "FK_4b988e0db89d94cebcf07f598cc"`);
        await queryRunner.query(`ALTER TABLE "emojis" ALTER COLUMN "guild_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "emojis" ADD CONSTRAINT "FK_emoji_guild_id" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(
            `ALTER TABLE "emojis" ADD CONSTRAINT "FK_emoji_application_id" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "emojis" DROP CONSTRAINT "FK_emoji_application_id"`);
        await queryRunner.query(`ALTER TABLE "emojis" DROP CONSTRAINT "FK_emoji_guild_id"`);
        await queryRunner.query(`ALTER TABLE "emojis" ALTER COLUMN "guild_id" SET NOT NULL`);
        await queryRunner.query(
            `ALTER TABLE "emojis" ADD CONSTRAINT "FK_4b988e0db89d94cebcf07f598cc" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(`ALTER TABLE "emojis" DROP COLUMN "application_id"`);
    }
}
