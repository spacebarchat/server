/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class staging1672833135670 {
	name = "staging1672833135670";

	async up(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_76ba283779c8441fd5ff819c8cf\``,
		);
		await queryRunner.query(
			`DROP INDEX \`REL_76ba283779c8441fd5ff819c8c\` ON \`users\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`id\` \`index\` varchar(255) NOT NULL`,
		);
		await queryRunner.query(
			`CREATE TABLE \`embed_cache\` (\`id\` varchar(255) NOT NULL, \`url\` varchar(255) NOT NULL, \`embed\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
		);
		await queryRunner.query(
			`CREATE TABLE \`security_settings\` (\`id\` varchar(255) NOT NULL, \`guild_id\` varchar(255) NULL, \`channel_id\` varchar(255) NULL, \`encryption_permission_mask\` int NOT NULL, \`allowed_algorithms\` text NOT NULL, \`current_algorithm\` varchar(255) NOT NULL, \`used_since_message\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
		);
		await queryRunner.query(
			`ALTER TABLE \`client_release\` DROP COLUMN \`deb_url\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`client_release\` DROP COLUMN \`osx_url\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`client_release\` DROP COLUMN \`win_url\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`users\` DROP COLUMN \`settingsId\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`client_release\` ADD \`platform\` varchar(255) NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`client_release\` ADD \`enabled\` tinyint NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`users\` ADD \`purchased_flags\` int NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`users\` ADD \`premium_usage_flags\` int NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`users\` ADD \`settingsIndex\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_0c14beb78d8c5ccba66072adbc\` (\`settingsIndex\`)`,
		);
		await queryRunner.query(
			`ALTER TABLE \`config\` CHANGE \`value\` \`value\` text NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`relationships\` CHANGE \`nickname\` \`nickname\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`connected_accounts\` DROP FOREIGN KEY \`FK_f47244225a6a1eac04a3463dd90\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`connected_accounts\` CHANGE \`user_id\` \`user_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`attachments\` DROP FOREIGN KEY \`FK_623e10eec51ada466c5038979e3\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`attachments\` CHANGE \`height\` \`height\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`attachments\` CHANGE \`width\` \`width\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`attachments\` CHANGE \`content_type\` \`content_type\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`attachments\` CHANGE \`message_id\` \`message_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`audit_logs\` DROP FOREIGN KEY \`FK_bd2726fd31b35443f2245b93ba0\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`audit_logs\` DROP FOREIGN KEY \`FK_3cd01cd3ae7aab010310d96ac8e\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`audit_logs\` CHANGE \`user_id\` \`user_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`audit_logs\` CHANGE \`options\` \`options\` text NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`audit_logs\` CHANGE \`reason\` \`reason\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`audit_logs\` CHANGE \`target_id\` \`target_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`backup_codes\` DROP FOREIGN KEY \`FK_70066ea80d2f4b871beda32633b\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`backup_codes\` CHANGE \`user_id\` \`user_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`bans\` DROP FOREIGN KEY \`FK_5999e8e449f80a236ff72023559\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`bans\` DROP FOREIGN KEY \`FK_9d3ab7dd180ebdd245cdb66ecad\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`bans\` DROP FOREIGN KEY \`FK_07ad88c86d1f290d46748410d58\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`bans\` CHANGE \`user_id\` \`user_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`bans\` CHANGE \`guild_id\` \`guild_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`bans\` CHANGE \`executor_id\` \`executor_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`bans\` CHANGE \`reason\` \`reason\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`categories\` CHANGE \`name\` \`name\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`categories\` CHANGE \`is_primary\` \`is_primary\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`client_release\` DROP COLUMN \`pub_date\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`client_release\` ADD \`pub_date\` datetime NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`client_release\` CHANGE \`notes\` \`notes\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`read_states\` CHANGE \`last_message_id\` \`last_message_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`read_states\` CHANGE \`public_ack\` \`public_ack\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`read_states\` CHANGE \`notifications_cursor\` \`notifications_cursor\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`read_states\` CHANGE \`last_pin_timestamp\` \`last_pin_timestamp\` datetime NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`read_states\` CHANGE \`mention_count\` \`mention_count\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`invites\` DROP FOREIGN KEY \`FK_3f4939aa1461e8af57fea3fb05d\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`invites\` DROP FOREIGN KEY \`FK_6a15b051fe5050aa00a4b9ff0f6\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`invites\` DROP FOREIGN KEY \`FK_15c35422032e0b22b4ada95f48f\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`invites\` DROP FOREIGN KEY \`FK_11a0d394f8fc649c19ce5f16b59\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`invites\` CHANGE \`guild_id\` \`guild_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`invites\` CHANGE \`channel_id\` \`channel_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`invites\` CHANGE \`inviter_id\` \`inviter_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`invites\` CHANGE \`target_user_id\` \`target_user_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`invites\` CHANGE \`target_user_type\` \`target_user_type\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`invites\` CHANGE \`vanity_url\` \`vanity_url\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`voice_states\` DROP FOREIGN KEY \`FK_03779ef216d4b0358470d9cb748\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`voice_states\` DROP FOREIGN KEY \`FK_9f8d389866b40b6657edd026dd4\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`voice_states\` DROP FOREIGN KEY \`FK_5fe1d5f931a67e85039c640001b\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`voice_states\` CHANGE \`guild_id\` \`guild_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`voice_states\` CHANGE \`channel_id\` \`channel_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`voice_states\` CHANGE \`user_id\` \`user_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`voice_states\` CHANGE \`token\` \`token\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`voice_states\` CHANGE \`self_stream\` \`self_stream\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`voice_states\` CHANGE \`request_to_speak_timestamp\` \`request_to_speak_timestamp\` datetime NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` DROP FOREIGN KEY \`FK_487a7af59d189f744fe394368fc\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` DROP FOREIGN KEY \`FK_df528cf77e82f8032230e7e37d8\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` DROP FOREIGN KEY \`FK_c3e5305461931763b56aa905f1c\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` DROP FOREIGN KEY \`FK_0d523f6f997c86e052c49b1455f\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` DROP FOREIGN KEY \`FK_3a285f4f49c40e0706d3018bc9f\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` CHANGE \`name\` \`name\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` CHANGE \`avatar\` \`avatar\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` CHANGE \`token\` \`token\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` CHANGE \`guild_id\` \`guild_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` CHANGE \`channel_id\` \`channel_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` CHANGE \`application_id\` \`application_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` CHANGE \`user_id\` \`user_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` CHANGE \`source_guild_id\` \`source_guild_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` DROP FOREIGN KEY \`FK_c253dafe5f3a03ec00cd8fb4581\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` DROP FOREIGN KEY \`FK_3274522d14af40540b1a883fc80\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` DROP FOREIGN KEY \`FK_3873ed438575cce703ecff4fc7b\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` CHANGE \`name\` \`name\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` CHANGE \`icon\` \`icon\` text NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` CHANGE \`last_message_id\` \`last_message_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` CHANGE \`guild_id\` \`guild_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` CHANGE \`parent_id\` \`parent_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` CHANGE \`owner_id\` \`owner_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` CHANGE \`last_pin_timestamp\` \`last_pin_timestamp\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` CHANGE \`default_auto_archive_duration\` \`default_auto_archive_duration\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` CHANGE \`position\` \`position\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` CHANGE \`permission_overwrites\` \`permission_overwrites\` text NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` CHANGE \`video_quality_mode\` \`video_quality_mode\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` CHANGE \`bitrate\` \`bitrate\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` CHANGE \`user_limit\` \`user_limit\` int NULL`,
		);
		await queryRunner.query(
			`UPDATE channels SET nsfw = 0 WHERE nsfw IS NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` CHANGE \`nsfw\` \`nsfw\` tinyint NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` CHANGE \`rate_limit_per_user\` \`rate_limit_per_user\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` CHANGE \`topic\` \`topic\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` CHANGE \`retention_policy_id\` \`retention_policy_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` CHANGE \`flags\` \`flags\` int NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` CHANGE \`default_thread_rate_limit_per_user\` \`default_thread_rate_limit_per_user\` int NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`emojis\` DROP FOREIGN KEY \`FK_fa7ddd5f9a214e28ce596548421\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`emojis\` CHANGE \`user_id\` \`user_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`emojis\` CHANGE \`groups\` \`groups\` text NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`notes\` DROP FOREIGN KEY \`FK_f9e103f8ae67cb1787063597925\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`notes\` DROP FOREIGN KEY \`FK_23e08e5b4481711d573e1abecdc\``,
		);
		await queryRunner.query(
			`DROP INDEX \`IDX_74e6689b9568cc965b8bfc9150\` ON \`notes\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`notes\` CHANGE \`owner_id\` \`owner_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`notes\` CHANGE \`target_id\` \`target_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`sessions\` DROP FOREIGN KEY \`FK_085d540d9f418cfbdc7bd55bb19\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`sessions\` CHANGE \`user_id\` \`user_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`sessions\` CHANGE \`activities\` \`activities\` text NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`stickers\` DROP FOREIGN KEY \`FK_e7cfa5cefa6661b3fb8fda8ce69\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`stickers\` DROP FOREIGN KEY \`FK_193d551d852aca5347ef5c9f205\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`stickers\` DROP FOREIGN KEY \`FK_8f4ee73f2bb2325ff980502e158\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`stickers\` CHANGE \`description\` \`description\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`stickers\` CHANGE \`available\` \`available\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`stickers\` CHANGE \`tags\` \`tags\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`stickers\` CHANGE \`pack_id\` \`pack_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`stickers\` CHANGE \`guild_id\` \`guild_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`stickers\` CHANGE \`user_id\` \`user_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`sticker_packs\` DROP FOREIGN KEY \`FK_448fafba4355ee1c837bbc865f1\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`sticker_packs\` CHANGE \`description\` \`description\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`sticker_packs\` CHANGE \`banner_asset_id\` \`banner_asset_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`sticker_packs\` CHANGE \`cover_sticker_id\` \`cover_sticker_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`sticker_packs\` CHANGE \`coverStickerId\` \`coverStickerId\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`templates\` DROP FOREIGN KEY \`FK_d7374b7f8f5fbfdececa4fb62e1\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`templates\` DROP FOREIGN KEY \`FK_445d00eaaea0e60a017a5ed0c11\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`templates\` CHANGE \`description\` \`description\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`templates\` CHANGE \`usage_count\` \`usage_count\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`templates\` CHANGE \`creator_id\` \`creator_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`templates\` CHANGE \`source_guild_id\` \`source_guild_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` DROP PRIMARY KEY`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` DROP COLUMN \`index\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` ADD \`index\` int NOT NULL PRIMARY KEY AUTO_INCREMENT`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`afk_timeout\` \`afk_timeout\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`allow_accessibility_detection\` \`allow_accessibility_detection\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`animate_emoji\` \`animate_emoji\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`animate_stickers\` \`animate_stickers\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`contact_sync_enabled\` \`contact_sync_enabled\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`convert_emoticons\` \`convert_emoticons\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`custom_status\` \`custom_status\` text NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`default_guilds_restricted\` \`default_guilds_restricted\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`detect_platform_accounts\` \`detect_platform_accounts\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`developer_mode\` \`developer_mode\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`disable_games_tab\` \`disable_games_tab\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`enable_tts_command\` \`enable_tts_command\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`explicit_content_filter\` \`explicit_content_filter\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`friend_source_flags\` \`friend_source_flags\` text NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`gateway_connected\` \`gateway_connected\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`gif_auto_play\` \`gif_auto_play\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`guild_folders\` \`guild_folders\` text NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`guild_positions\` \`guild_positions\` text NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`inline_attachment_media\` \`inline_attachment_media\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`inline_embed_media\` \`inline_embed_media\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`locale\` \`locale\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`message_display_compact\` \`message_display_compact\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`native_phone_integration_enabled\` \`native_phone_integration_enabled\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`render_embeds\` \`render_embeds\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`render_reactions\` \`render_reactions\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`restricted_guilds\` \`restricted_guilds\` text NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`show_current_game\` \`show_current_game\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`status\` \`status\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`stream_notifications_enabled\` \`stream_notifications_enabled\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`theme\` \`theme\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`user_settings\` CHANGE \`timezone_offset\` \`timezone_offset\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` DROP FOREIGN KEY \`FK_f591a66b8019d87b0fe6c12dad6\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` DROP FOREIGN KEY \`FK_e2a2f873a64a5cf62526de42325\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` DROP FOREIGN KEY \`FK_fc1a451727e3643ca572a3bb394\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` DROP FOREIGN KEY \`FK_8d450b016dc8bec35f36729e4b0\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` DROP FOREIGN KEY \`FK_95828668aa333460582e0ca6396\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` DROP FOREIGN KEY \`FK_cfc3d3ad260f8121c95b31a1fce\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` DROP FOREIGN KEY \`FK_9d1d665379eefde7876a17afa99\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`afk_channel_id\` \`afk_channel_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`afk_timeout\` \`afk_timeout\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`banner\` \`banner\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`default_message_notifications\` \`default_message_notifications\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`description\` \`description\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`discovery_splash\` \`discovery_splash\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`explicit_content_filter\` \`explicit_content_filter\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` DROP COLUMN \`primary_category_id\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` ADD \`primary_category_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`icon\` \`icon\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`UPDATE guilds SET large = 0 WHERE large IS NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`large\` \`large\` tinyint NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`max_members\` \`max_members\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`max_presences\` \`max_presences\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`max_video_channel_users\` \`max_video_channel_users\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`member_count\` \`member_count\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`presence_count\` \`presence_count\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`template_id\` \`template_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`mfa_level\` \`mfa_level\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`owner_id\` \`owner_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`preferred_locale\` \`preferred_locale\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`premium_subscription_count\` \`premium_subscription_count\` int NULL`,
		);
		await queryRunner.query(
			`UPDATE guilds SET premium_tier = 0 WHERE premium_tier IS NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`premium_tier\` \`premium_tier\` int NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`public_updates_channel_id\` \`public_updates_channel_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`rules_channel_id\` \`rules_channel_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`region\` \`region\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`splash\` \`splash\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`system_channel_id\` \`system_channel_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`system_channel_flags\` \`system_channel_flags\` int NULL`,
		);
		await queryRunner.query(
			`UPDATE guilds SET unavailable = 0 WHERE unavailable IS NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`unavailable\` \`unavailable\` tinyint NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`verification_level\` \`verification_level\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`widget_channel_id\` \`widget_channel_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`UPDATE guilds SET widget_enabled = 0 WHERE widget_enabled IS NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`widget_enabled\` \`widget_enabled\` tinyint NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`nsfw_level\` \`nsfw_level\` int NULL`,
		);
		await queryRunner.query(
			`UPDATE guilds SET nsfw = 0 WHERE nsfw IS NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`nsfw\` \`nsfw\` tinyint NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`parent\` \`parent\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` CHANGE \`premium_progress_bar_enabled\` \`premium_progress_bar_enabled\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`roles\` DROP FOREIGN KEY \`FK_c32c1ab1c4dc7dcb0278c4b1b8b\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`roles\` CHANGE \`guild_id\` \`guild_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`roles\` CHANGE \`icon\` \`icon\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`roles\` CHANGE \`unicode_emoji\` \`unicode_emoji\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`roles\` CHANGE \`tags\` \`tags\` text NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_86b9109b155eb70c0a2ca3b4b6d\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_b193588441b085352a4c0109423\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_05535bc695e9f7ee104616459d3\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_b0525304f2262b7014245351c76\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_f83c04bcf1df4e5c0e7a52ed348\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_5d3ec1cb962de6488637fd779d6\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_61a92bb65b302a76d9c1fcd3174\``,
		);
		await queryRunner.query(
			`DROP INDEX \`IDX_3ed7a60fb7dbe04e1ba9332a8b\` ON \`messages\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` CHANGE \`channel_id\` \`channel_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` CHANGE \`guild_id\` \`guild_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` CHANGE \`author_id\` \`author_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` CHANGE \`member_id\` \`member_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` CHANGE \`webhook_id\` \`webhook_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` CHANGE \`application_id\` \`application_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` CHANGE \`content\` \`content\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` CHANGE \`edited_timestamp\` \`edited_timestamp\` datetime NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` CHANGE \`tts\` \`tts\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` CHANGE \`mention_everyone\` \`mention_everyone\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` CHANGE \`nonce\` \`nonce\` text NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` CHANGE \`pinned\` \`pinned\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` CHANGE \`activity\` \`activity\` text NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` CHANGE \`flags\` \`flags\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` CHANGE \`message_reference\` \`message_reference\` text NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` CHANGE \`interaction\` \`interaction\` text NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` CHANGE \`components\` \`components\` text NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` CHANGE \`message_reference_id\` \`message_reference_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`members\` CHANGE \`nick\` \`nick\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`members\` DROP COLUMN \`premium_since\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`members\` ADD \`premium_since\` bigint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`members\` CHANGE \`last_message_id\` \`last_message_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`members\` CHANGE \`joined_by\` \`joined_by\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`members\` CHANGE \`avatar\` \`avatar\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`members\` CHANGE \`banner\` \`banner\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`members\` CHANGE \`communication_disabled_until\` \`communication_disabled_until\` datetime NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`users\` CHANGE \`avatar\` \`avatar\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`users\` CHANGE \`accent_color\` \`accent_color\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`users\` CHANGE \`banner\` \`banner\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`users\` CHANGE \`phone\` \`phone\` varchar(255) NULL`,
		);
		await queryRunner.query(`UPDATE users SET bio = "" WHERE bio IS NULL`);
		await queryRunner.query(
			`ALTER TABLE \`users\` CHANGE \`bio\` \`bio\` varchar(255) NOT NULL`,
		);
		await queryRunner.query(
			`UPDATE users SET mfa_enabled = 0 WHERE mfa_enabled IS NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`users\` CHANGE \`mfa_enabled\` \`mfa_enabled\` tinyint NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`users\` CHANGE \`totp_secret\` \`totp_secret\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`users\` CHANGE \`totp_last_ticket\` \`totp_last_ticket\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`users\` CHANGE \`premium_since\` \`premium_since\` datetime NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`users\` CHANGE \`email\` \`email\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`team_members\` DROP FOREIGN KEY \`FK_fdad7d5768277e60c40e01cdcea\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`team_members\` DROP FOREIGN KEY \`FK_c2bf4967c8c2a6b845dadfbf3d4\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`team_members\` CHANGE \`team_id\` \`team_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`team_members\` CHANGE \`user_id\` \`user_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`teams\` DROP FOREIGN KEY \`FK_13f00abf7cb6096c43ecaf8c108\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`teams\` CHANGE \`icon\` \`icon\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`teams\` CHANGE \`owner_user_id\` \`owner_user_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` DROP FOREIGN KEY \`FK_e57508958bf92b9d9d25231b5e8\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` DROP FOREIGN KEY \`FK_2ce5a55796fe4c2f77ece57a647\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` DROP FOREIGN KEY \`FK_a36ed02953077f408d0f3ebc424\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` CHANGE \`icon\` \`icon\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` CHANGE \`description\` \`description\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` CHANGE \`summary\` \`summary\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` CHANGE \`type\` \`type\` text NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` CHANGE \`redirect_uris\` \`redirect_uris\` text NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` CHANGE \`rpc_application_state\` \`rpc_application_state\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` CHANGE \`store_application_state\` \`store_application_state\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` CHANGE \`verification_state\` \`verification_state\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` CHANGE \`interactions_endpoint_url\` \`interactions_endpoint_url\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` CHANGE \`integration_public\` \`integration_public\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` CHANGE \`integration_require_code_grant\` \`integration_require_code_grant\` tinyint NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` CHANGE \`discoverability_state\` \`discoverability_state\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` CHANGE \`discovery_eligibility_flags\` \`discovery_eligibility_flags\` int NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` CHANGE \`tags\` \`tags\` text NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` CHANGE \`cover_image\` \`cover_image\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` CHANGE \`install_params\` \`install_params\` text NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` CHANGE \`terms_of_service_url\` \`terms_of_service_url\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` CHANGE \`privacy_policy_url\` \`privacy_policy_url\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` CHANGE \`owner_id\` \`owner_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` CHANGE \`bot_user_id\` \`bot_user_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` CHANGE \`team_id\` \`team_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` CHANGE \`name\` \`name\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` CHANGE \`avatar\` \`avatar\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` CHANGE \`token\` \`token\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` CHANGE \`guild_id\` \`guild_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` CHANGE \`channel_id\` \`channel_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` CHANGE \`application_id\` \`application_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` CHANGE \`user_id\` \`user_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` CHANGE \`source_guild_id\` \`source_guild_id\` varchar(255) NULL`,
		);
		await queryRunner.query(
			`CREATE UNIQUE INDEX \`IDX_74e6689b9568cc965b8bfc9150\` ON \`notes\` (\`owner_id\`, \`target_id\`)`,
		);
		await queryRunner.query(
			`CREATE UNIQUE INDEX \`IDX_3ed7a60fb7dbe04e1ba9332a8b\` ON \`messages\` (\`channel_id\`, \`id\`)`,
		);
		await queryRunner.query(
			`CREATE UNIQUE INDEX \`REL_0c14beb78d8c5ccba66072adbc\` ON \`users\` (\`settingsIndex\`)`,
		);
		await queryRunner.query(
			`ALTER TABLE \`connected_accounts\` ADD CONSTRAINT \`FK_f47244225a6a1eac04a3463dd90\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`attachments\` ADD CONSTRAINT \`FK_623e10eec51ada466c5038979e3\` FOREIGN KEY (\`message_id\`) REFERENCES \`messages\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`audit_logs\` ADD CONSTRAINT \`FK_3cd01cd3ae7aab010310d96ac8e\` FOREIGN KEY (\`target_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`audit_logs\` ADD CONSTRAINT \`FK_bd2726fd31b35443f2245b93ba0\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`backup_codes\` ADD CONSTRAINT \`FK_70066ea80d2f4b871beda32633b\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`bans\` ADD CONSTRAINT \`FK_5999e8e449f80a236ff72023559\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`bans\` ADD CONSTRAINT \`FK_9d3ab7dd180ebdd245cdb66ecad\` FOREIGN KEY (\`guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`bans\` ADD CONSTRAINT \`FK_07ad88c86d1f290d46748410d58\` FOREIGN KEY (\`executor_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`invites\` ADD CONSTRAINT \`FK_3f4939aa1461e8af57fea3fb05d\` FOREIGN KEY (\`guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`invites\` ADD CONSTRAINT \`FK_6a15b051fe5050aa00a4b9ff0f6\` FOREIGN KEY (\`channel_id\`) REFERENCES \`channels\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`invites\` ADD CONSTRAINT \`FK_15c35422032e0b22b4ada95f48f\` FOREIGN KEY (\`inviter_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`invites\` ADD CONSTRAINT \`FK_11a0d394f8fc649c19ce5f16b59\` FOREIGN KEY (\`target_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`voice_states\` ADD CONSTRAINT \`FK_03779ef216d4b0358470d9cb748\` FOREIGN KEY (\`guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`voice_states\` ADD CONSTRAINT \`FK_9f8d389866b40b6657edd026dd4\` FOREIGN KEY (\`channel_id\`) REFERENCES \`channels\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`voice_states\` ADD CONSTRAINT \`FK_5fe1d5f931a67e85039c640001b\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` ADD CONSTRAINT \`FK_487a7af59d189f744fe394368fc\` FOREIGN KEY (\`guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` ADD CONSTRAINT \`FK_df528cf77e82f8032230e7e37d8\` FOREIGN KEY (\`channel_id\`) REFERENCES \`channels\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` ADD CONSTRAINT \`FK_c3e5305461931763b56aa905f1c\` FOREIGN KEY (\`application_id\`) REFERENCES \`applications\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` ADD CONSTRAINT \`FK_0d523f6f997c86e052c49b1455f\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`webhooks\` ADD CONSTRAINT \`FK_3a285f4f49c40e0706d3018bc9f\` FOREIGN KEY (\`source_guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` ADD CONSTRAINT \`FK_c253dafe5f3a03ec00cd8fb4581\` FOREIGN KEY (\`guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` ADD CONSTRAINT \`FK_3274522d14af40540b1a883fc80\` FOREIGN KEY (\`parent_id\`) REFERENCES \`channels\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`channels\` ADD CONSTRAINT \`FK_3873ed438575cce703ecff4fc7b\` FOREIGN KEY (\`owner_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`emojis\` ADD CONSTRAINT \`FK_fa7ddd5f9a214e28ce596548421\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`notes\` ADD CONSTRAINT \`FK_f9e103f8ae67cb1787063597925\` FOREIGN KEY (\`owner_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`notes\` ADD CONSTRAINT \`FK_23e08e5b4481711d573e1abecdc\` FOREIGN KEY (\`target_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`sessions\` ADD CONSTRAINT \`FK_085d540d9f418cfbdc7bd55bb19\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`stickers\` ADD CONSTRAINT \`FK_e7cfa5cefa6661b3fb8fda8ce69\` FOREIGN KEY (\`pack_id\`) REFERENCES \`sticker_packs\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`stickers\` ADD CONSTRAINT \`FK_193d551d852aca5347ef5c9f205\` FOREIGN KEY (\`guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`stickers\` ADD CONSTRAINT \`FK_8f4ee73f2bb2325ff980502e158\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`sticker_packs\` ADD CONSTRAINT \`FK_448fafba4355ee1c837bbc865f1\` FOREIGN KEY (\`coverStickerId\`) REFERENCES \`stickers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`templates\` ADD CONSTRAINT \`FK_d7374b7f8f5fbfdececa4fb62e1\` FOREIGN KEY (\`creator_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`templates\` ADD CONSTRAINT \`FK_445d00eaaea0e60a017a5ed0c11\` FOREIGN KEY (\`source_guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` ADD CONSTRAINT \`FK_f591a66b8019d87b0fe6c12dad6\` FOREIGN KEY (\`afk_channel_id\`) REFERENCES \`channels\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` ADD CONSTRAINT \`FK_e2a2f873a64a5cf62526de42325\` FOREIGN KEY (\`template_id\`) REFERENCES \`templates\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` ADD CONSTRAINT \`FK_fc1a451727e3643ca572a3bb394\` FOREIGN KEY (\`owner_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` ADD CONSTRAINT \`FK_8d450b016dc8bec35f36729e4b0\` FOREIGN KEY (\`public_updates_channel_id\`) REFERENCES \`channels\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` ADD CONSTRAINT \`FK_95828668aa333460582e0ca6396\` FOREIGN KEY (\`rules_channel_id\`) REFERENCES \`channels\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` ADD CONSTRAINT \`FK_cfc3d3ad260f8121c95b31a1fce\` FOREIGN KEY (\`system_channel_id\`) REFERENCES \`channels\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`guilds\` ADD CONSTRAINT \`FK_9d1d665379eefde7876a17afa99\` FOREIGN KEY (\`widget_channel_id\`) REFERENCES \`channels\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`roles\` ADD CONSTRAINT \`FK_c32c1ab1c4dc7dcb0278c4b1b8b\` FOREIGN KEY (\`guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_86b9109b155eb70c0a2ca3b4b6d\` FOREIGN KEY (\`channel_id\`) REFERENCES \`channels\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_b193588441b085352a4c0109423\` FOREIGN KEY (\`guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_05535bc695e9f7ee104616459d3\` FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_b0525304f2262b7014245351c76\` FOREIGN KEY (\`member_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_f83c04bcf1df4e5c0e7a52ed348\` FOREIGN KEY (\`webhook_id\`) REFERENCES \`webhooks\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_5d3ec1cb962de6488637fd779d6\` FOREIGN KEY (\`application_id\`) REFERENCES \`applications\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`messages\` ADD CONSTRAINT \`FK_61a92bb65b302a76d9c1fcd3174\` FOREIGN KEY (\`message_reference_id\`) REFERENCES \`messages\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_0c14beb78d8c5ccba66072adbc7\` FOREIGN KEY (\`settingsIndex\`) REFERENCES \`user_settings\`(\`index\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`team_members\` ADD CONSTRAINT \`FK_fdad7d5768277e60c40e01cdcea\` FOREIGN KEY (\`team_id\`) REFERENCES \`teams\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`team_members\` ADD CONSTRAINT \`FK_c2bf4967c8c2a6b845dadfbf3d4\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`teams\` ADD CONSTRAINT \`FK_13f00abf7cb6096c43ecaf8c108\` FOREIGN KEY (\`owner_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` ADD CONSTRAINT \`FK_e57508958bf92b9d9d25231b5e8\` FOREIGN KEY (\`owner_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` ADD CONSTRAINT \`FK_2ce5a55796fe4c2f77ece57a647\` FOREIGN KEY (\`bot_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE \`applications\` ADD CONSTRAINT \`FK_a36ed02953077f408d0f3ebc424\` FOREIGN KEY (\`team_id\`) REFERENCES \`teams\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
	}

	async down(queryRunner) {}
};
