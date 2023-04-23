import { MigrationInterface, QueryRunner } from "typeorm";

export class addViewNsfwGuilds1682266442134 implements MigrationInterface {
	name = "addViewNsfwGuilds1682266442134";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "temporary_user_settings" ("index" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "afk_timeout" integer, "allow_accessibility_detection" boolean, "animate_emoji" boolean, "animate_stickers" integer, "contact_sync_enabled" boolean, "convert_emoticons" boolean, "custom_status" text, "default_guilds_restricted" boolean, "detect_platform_accounts" boolean, "developer_mode" boolean, "disable_games_tab" boolean, "enable_tts_command" boolean, "explicit_content_filter" integer, "friend_source_flags" text, "gateway_connected" boolean, "gif_auto_play" boolean, "guild_folders" text, "guild_positions" text, "inline_attachment_media" boolean, "inline_embed_media" boolean, "locale" varchar, "message_display_compact" boolean, "native_phone_integration_enabled" boolean, "render_embeds" boolean, "render_reactions" boolean, "restricted_guilds" text, "show_current_game" boolean, "status" varchar, "stream_notifications_enabled" boolean, "theme" varchar, "timezone_offset" integer, "view_nsfw_guilds" boolean)`,
		);
		await queryRunner.query(
			`INSERT INTO "temporary_user_settings"("index", "afk_timeout", "allow_accessibility_detection", "animate_emoji", "animate_stickers", "contact_sync_enabled", "convert_emoticons", "custom_status", "default_guilds_restricted", "detect_platform_accounts", "developer_mode", "disable_games_tab", "enable_tts_command", "explicit_content_filter", "friend_source_flags", "gateway_connected", "gif_auto_play", "guild_folders", "guild_positions", "inline_attachment_media", "inline_embed_media", "locale", "message_display_compact", "native_phone_integration_enabled", "render_embeds", "render_reactions", "restricted_guilds", "show_current_game", "status", "stream_notifications_enabled", "theme", "timezone_offset") SELECT "index", "afk_timeout", "allow_accessibility_detection", "animate_emoji", "animate_stickers", "contact_sync_enabled", "convert_emoticons", "custom_status", "default_guilds_restricted", "detect_platform_accounts", "developer_mode", "disable_games_tab", "enable_tts_command", "explicit_content_filter", "friend_source_flags", "gateway_connected", "gif_auto_play", "guild_folders", "guild_positions", "inline_attachment_media", "inline_embed_media", "locale", "message_display_compact", "native_phone_integration_enabled", "render_embeds", "render_reactions", "restricted_guilds", "show_current_game", "status", "stream_notifications_enabled", "theme", "timezone_offset" FROM "user_settings"`,
		);
		await queryRunner.query(`DROP TABLE "user_settings"`);
		await queryRunner.query(
			`ALTER TABLE "temporary_user_settings" RENAME TO "user_settings"`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "user_settings" RENAME TO "temporary_user_settings"`,
		);
		await queryRunner.query(
			`CREATE TABLE "user_settings" ("index" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "afk_timeout" integer, "allow_accessibility_detection" boolean, "animate_emoji" boolean, "animate_stickers" integer, "contact_sync_enabled" boolean, "convert_emoticons" boolean, "custom_status" text, "default_guilds_restricted" boolean, "detect_platform_accounts" boolean, "developer_mode" boolean, "disable_games_tab" boolean, "enable_tts_command" boolean, "explicit_content_filter" integer, "friend_source_flags" text, "gateway_connected" boolean, "gif_auto_play" boolean, "guild_folders" text, "guild_positions" text, "inline_attachment_media" boolean, "inline_embed_media" boolean, "locale" varchar, "message_display_compact" boolean, "native_phone_integration_enabled" boolean, "render_embeds" boolean, "render_reactions" boolean, "restricted_guilds" text, "show_current_game" boolean, "status" varchar, "stream_notifications_enabled" boolean, "theme" varchar, "timezone_offset" integer)`,
		);
		await queryRunner.query(
			`INSERT INTO "user_settings"("index", "afk_timeout", "allow_accessibility_detection", "animate_emoji", "animate_stickers", "contact_sync_enabled", "convert_emoticons", "custom_status", "default_guilds_restricted", "detect_platform_accounts", "developer_mode", "disable_games_tab", "enable_tts_command", "explicit_content_filter", "friend_source_flags", "gateway_connected", "gif_auto_play", "guild_folders", "guild_positions", "inline_attachment_media", "inline_embed_media", "locale", "message_display_compact", "native_phone_integration_enabled", "render_embeds", "render_reactions", "restricted_guilds", "show_current_game", "status", "stream_notifications_enabled", "theme", "timezone_offset") SELECT "index", "afk_timeout", "allow_accessibility_detection", "animate_emoji", "animate_stickers", "contact_sync_enabled", "convert_emoticons", "custom_status", "default_guilds_restricted", "detect_platform_accounts", "developer_mode", "disable_games_tab", "enable_tts_command", "explicit_content_filter", "friend_source_flags", "gateway_connected", "gif_auto_play", "guild_folders", "guild_positions", "inline_attachment_media", "inline_embed_media", "locale", "message_display_compact", "native_phone_integration_enabled", "render_embeds", "render_reactions", "restricted_guilds", "show_current_game", "status", "stream_notifications_enabled", "theme", "timezone_offset" FROM "temporary_user_settings"`,
		);
		await queryRunner.query(`DROP TABLE "temporary_user_settings"`);
	}
}
