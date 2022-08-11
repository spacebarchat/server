import { MigrationInterface, QueryRunner } from "typeorm";

export class CodeCleanup21660257815436 implements MigrationInterface {
    name = 'CodeCleanup21660257815436'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "user_settings" (
                "id" character varying NOT NULL,
                "afk_timeout" integer,
                "allow_accessibility_detection" boolean,
                "animate_emoji" boolean,
                "animate_stickers" integer,
                "contact_sync_enabled" boolean,
                "convert_emoticons" boolean,
                "custom_status" text,
                "default_guilds_restricted" boolean,
                "detect_platform_accounts" boolean,
                "developer_mode" boolean,
                "disable_games_tab" boolean,
                "enable_tts_command" boolean,
                "explicit_content_filter" integer,
                "friend_source_flags" text,
                "gateway_connected" boolean,
                "gif_auto_play" boolean,
                "guild_folders" text,
                "guild_positions" text,
                "inline_attachment_media" boolean,
                "inline_embed_media" boolean,
                "locale" character varying,
                "message_display_compact" boolean,
                "native_phone_integration_enabled" boolean,
                "render_embeds" boolean,
                "render_reactions" boolean,
                "restricted_guilds" text,
                "show_current_game" boolean,
                "status" character varying,
                "stream_notifications_enabled" boolean,
                "theme" character varying,
                "timezone_offset" integer,
                CONSTRAINT "PK_00f004f5922a0744d174530d639" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "guilds"
            ADD "premium_progress_bar_enabled" boolean
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "guilds" DROP COLUMN "premium_progress_bar_enabled"
        `);
        await queryRunner.query(`
            DROP TABLE "user_settings"
        `);
    }

}
