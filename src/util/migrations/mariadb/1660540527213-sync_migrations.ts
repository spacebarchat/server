import { MigrationInterface, QueryRunner } from "typeorm";

export class syncMigrations1660540527213 implements MigrationInterface {
	name = "syncMigrations1660540527213";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE \`invites\` DROP FOREIGN KEY \`FK_15c35422032e0b22b4ada95f48f\`
        `);
		await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`settings\` \`settingsId\` text NOT NULL
        `);
		await queryRunner.query(`
            CREATE TABLE \`user_settings\` (
                \`id\` varchar(255) NOT NULL,
                \`afk_timeout\` int NULL,
                \`allow_accessibility_detection\` tinyint NULL,
                \`animate_emoji\` tinyint NULL,
                \`animate_stickers\` int NULL,
                \`contact_sync_enabled\` tinyint NULL,
                \`convert_emoticons\` tinyint NULL,
                \`custom_status\` text NULL,
                \`default_guilds_restricted\` tinyint NULL,
                \`detect_platform_accounts\` tinyint NULL,
                \`developer_mode\` tinyint NULL,
                \`disable_games_tab\` tinyint NULL,
                \`enable_tts_command\` tinyint NULL,
                \`explicit_content_filter\` int NULL,
                \`friend_source_flags\` text NULL,
                \`gateway_connected\` tinyint NULL,
                \`gif_auto_play\` tinyint NULL,
                \`guild_folders\` text NULL,
                \`guild_positions\` text NULL,
                \`inline_attachment_media\` tinyint NULL,
                \`inline_embed_media\` tinyint NULL,
                \`locale\` varchar(255) NULL,
                \`message_display_compact\` tinyint NULL,
                \`native_phone_integration_enabled\` tinyint NULL,
                \`render_embeds\` tinyint NULL,
                \`render_reactions\` tinyint NULL,
                \`restricted_guilds\` text NULL,
                \`show_current_game\` tinyint NULL,
                \`status\` varchar(255) NULL,
                \`stream_notifications_enabled\` tinyint NULL,
                \`theme\` varchar(255) NULL,
                \`timezone_offset\` int NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
		await queryRunner.query(`
            ALTER TABLE \`channels\`
            ADD \`flags\` int NULL
        `);
		await queryRunner.query(`
            ALTER TABLE \`channels\`
            ADD \`default_thread_rate_limit_per_user\` int NULL
        `);
		await queryRunner.query(`
            ALTER TABLE \`guilds\`
            ADD \`premium_progress_bar_enabled\` tinyint NULL
        `);
		await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`settingsId\`
        `);
		await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`settingsId\` varchar(255) NULL
        `);
		await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD UNIQUE INDEX \`IDX_76ba283779c8441fd5ff819c8c\` (\`settingsId\`)
        `);
		await queryRunner.query(`
            CREATE UNIQUE INDEX \`REL_76ba283779c8441fd5ff819c8c\` ON \`users\` (\`settingsId\`)
        `);
		await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD CONSTRAINT \`FK_76ba283779c8441fd5ff819c8cf\` FOREIGN KEY (\`settingsId\`) REFERENCES \`user_settings\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE \`invites\`
            ADD CONSTRAINT \`FK_15c35422032e0b22b4ada95f48f\` FOREIGN KEY (\`inviter_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE \`invites\` DROP FOREIGN KEY \`FK_15c35422032e0b22b4ada95f48f\`
        `);
		await queryRunner.query(`
            ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_76ba283779c8441fd5ff819c8cf\`
        `);
		await queryRunner.query(`
            DROP INDEX \`REL_76ba283779c8441fd5ff819c8c\` ON \`users\`
        `);
		await queryRunner.query(`
            ALTER TABLE \`users\` DROP INDEX \`IDX_76ba283779c8441fd5ff819c8c\`
        `);
		await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`settingsId\`
        `);
		await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`settingsId\` text NOT NULL
        `);
		await queryRunner.query(`
            ALTER TABLE \`guilds\` DROP COLUMN \`premium_progress_bar_enabled\`
        `);
		await queryRunner.query(`
            ALTER TABLE \`channels\` DROP COLUMN \`default_thread_rate_limit_per_user\`
        `);
		await queryRunner.query(`
            ALTER TABLE \`channels\` DROP COLUMN \`flags\`
        `);
		await queryRunner.query(`
            DROP TABLE \`user_settings\`
        `);
		await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`settingsId\` \`settings\` text NOT NULL
        `);
		await queryRunner.query(`
            ALTER TABLE \`invites\`
            ADD CONSTRAINT \`FK_15c35422032e0b22b4ada95f48f\` FOREIGN KEY (\`inviter_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
	}
}
