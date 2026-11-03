import { MigrationInterface, QueryRunner } from "typeorm";

export class RoleStickerEmojiGuildIndexes1793720801192 implements MigrationInterface {
    name = "RoleStickerEmojiGuildIndexes1793720801192";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_role_guild_id"`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "guild_id" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_role_guild_id" ON "roles"  ("guild_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_sticker_guild_id" ON "stickers"  ("guild_id") WHERE guild_id IS NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_emoji_guild_id" ON "emojis"  ("guild_id") WHERE guild_id IS NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_channel_guild_id" ON "channels"  ("guild_id") WHERE guild_id IS NOT NULL`);
        await queryRunner.query(`ALTER TABLE "roles" ADD CONSTRAINT "FK_role_guild_id" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_role_guild_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_channel_guild_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_emoji_guild_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_sticker_guild_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_role_guild_id"`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "guild_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "roles" ADD CONSTRAINT "FK_role_guild_id" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
}
