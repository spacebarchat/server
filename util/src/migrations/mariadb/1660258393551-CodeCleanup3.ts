import { MigrationInterface, QueryRunner } from "typeorm";

export class CodeCleanup31660258393551 implements MigrationInterface {
    name = 'CodeCleanup31660258393551'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP FOREIGN KEY \`FK_2ce5a55796fe4c2f77ece57a647\`
        `);
        await queryRunner.query(`
            DROP INDEX \`REL_2ce5a55796fe4c2f77ece57a64\` ON \`applications\`
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
            ALTER TABLE \`users\` DROP COLUMN \`settings\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP COLUMN \`type\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP COLUMN \`hook\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP COLUMN \`redirect_uris\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP COLUMN \`rpc_application_state\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP COLUMN \`store_application_state\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP COLUMN \`verification_state\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP COLUMN \`interactions_endpoint_url\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP COLUMN \`integration_public\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP COLUMN \`integration_require_code_grant\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP COLUMN \`discoverability_state\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP COLUMN \`discovery_eligibility_flags\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP COLUMN \`tags\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP COLUMN \`install_params\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP COLUMN \`bot_user_id\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`guilds\`
            ADD \`premium_progress_bar_enabled\` tinyint NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD \`rpc_origins\` text NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD \`primary_sku_id\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD \`slug\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD \`guild_id\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` CHANGE \`description\` \`description\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP COLUMN \`flags\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD \`flags\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD CONSTRAINT \`FK_e5bf78cdbbe9ba91062d74c5aba\` FOREIGN KEY (\`guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP FOREIGN KEY \`FK_e5bf78cdbbe9ba91062d74c5aba\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP COLUMN \`flags\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD \`flags\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` CHANGE \`description\` \`description\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP COLUMN \`guild_id\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP COLUMN \`slug\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP COLUMN \`primary_sku_id\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP COLUMN \`rpc_origins\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`guilds\` DROP COLUMN \`premium_progress_bar_enabled\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD \`bot_user_id\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD \`install_params\` text NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD \`tags\` text NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD \`discovery_eligibility_flags\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD \`discoverability_state\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD \`integration_require_code_grant\` tinyint NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD \`integration_public\` tinyint NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD \`interactions_endpoint_url\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD \`verification_state\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD \`store_application_state\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD \`rpc_application_state\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD \`redirect_uris\` text NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD \`hook\` tinyint NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD \`type\` text NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`settings\` text NOT NULL
        `);
        await queryRunner.query(`
            DROP TABLE \`user_settings\`
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`REL_2ce5a55796fe4c2f77ece57a64\` ON \`applications\` (\`bot_user_id\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD CONSTRAINT \`FK_2ce5a55796fe4c2f77ece57a647\` FOREIGN KEY (\`bot_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
