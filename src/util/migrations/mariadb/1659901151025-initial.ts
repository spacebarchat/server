import { MigrationInterface, QueryRunner } from "typeorm";

export class initial1659901151025 implements MigrationInterface {
    name = 'initial1659901151025'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`config\` (
                \`key\` varchar(255) NOT NULL,
                \`value\` text NULL,
                PRIMARY KEY (\`key\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`relationships\` (
                \`id\` varchar(255) NOT NULL,
                \`from_id\` varchar(255) NOT NULL,
                \`to_id\` varchar(255) NOT NULL,
                \`nickname\` varchar(255) NULL,
                \`type\` int NOT NULL,
                UNIQUE INDEX \`IDX_a0b2ff0a598df0b0d055934a17\` (\`from_id\`, \`to_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`connected_accounts\` (
                \`id\` varchar(255) NOT NULL,
                \`user_id\` varchar(255) NULL,
                \`access_token\` varchar(255) NOT NULL,
                \`friend_sync\` tinyint NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`revoked\` tinyint NOT NULL,
                \`show_activity\` tinyint NOT NULL,
                \`type\` varchar(255) NOT NULL,
                \`verified\` tinyint NOT NULL,
                \`visibility\` int NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` varchar(255) NOT NULL,
                \`username\` varchar(255) NOT NULL,
                \`discriminator\` varchar(255) NOT NULL,
                \`avatar\` varchar(255) NULL,
                \`accent_color\` int NULL,
                \`banner\` varchar(255) NULL,
                \`phone\` varchar(255) NULL,
                \`desktop\` tinyint NOT NULL,
                \`mobile\` tinyint NOT NULL,
                \`premium\` tinyint NOT NULL,
                \`premium_type\` int NOT NULL,
                \`bot\` tinyint NOT NULL,
                \`bio\` varchar(255) NOT NULL,
                \`system\` tinyint NOT NULL,
                \`nsfw_allowed\` tinyint NOT NULL,
                \`mfa_enabled\` tinyint NOT NULL,
                \`totp_secret\` varchar(255) NULL,
                \`totp_last_ticket\` varchar(255) NULL,
                \`created_at\` datetime NOT NULL,
                \`premium_since\` datetime NULL,
                \`verified\` tinyint NOT NULL,
                \`disabled\` tinyint NOT NULL,
                \`deleted\` tinyint NOT NULL,
                \`email\` varchar(255) NULL,
                \`flags\` varchar(255) NOT NULL,
                \`public_flags\` int NOT NULL,
                \`rights\` bigint NOT NULL,
                \`data\` text NOT NULL,
                \`fingerprints\` text NOT NULL,
                \`settings\` text NOT NULL,
                \`extended_settings\` text NOT NULL,
                \`notes\` text NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`backup_codes\` (
                \`id\` varchar(255) NOT NULL,
                \`code\` varchar(255) NOT NULL,
                \`consumed\` tinyint NOT NULL,
                \`expired\` tinyint NOT NULL,
                \`user_id\` varchar(255) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`bans\` (
                \`id\` varchar(255) NOT NULL,
                \`user_id\` varchar(255) NULL,
                \`guild_id\` varchar(255) NULL,
                \`executor_id\` varchar(255) NULL,
                \`ip\` varchar(255) NOT NULL,
                \`reason\` varchar(255) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`recipients\` (
                \`id\` varchar(255) NOT NULL,
                \`channel_id\` varchar(255) NOT NULL,
                \`user_id\` varchar(255) NOT NULL,
                \`closed\` tinyint NOT NULL DEFAULT 0,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`roles\` (
                \`id\` varchar(255) NOT NULL,
                \`guild_id\` varchar(255) NULL,
                \`color\` int NOT NULL,
                \`hoist\` tinyint NOT NULL,
                \`managed\` tinyint NOT NULL,
                \`mentionable\` tinyint NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`permissions\` varchar(255) NOT NULL,
                \`position\` int NOT NULL,
                \`icon\` varchar(255) NULL,
                \`unicode_emoji\` varchar(255) NULL,
                \`tags\` text NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`members\` (
                \`index\` int NOT NULL AUTO_INCREMENT,
                \`id\` varchar(255) NOT NULL,
                \`guild_id\` varchar(255) NOT NULL,
                \`nick\` varchar(255) NULL,
                \`joined_at\` datetime NOT NULL,
                \`premium_since\` bigint NULL,
                \`deaf\` tinyint NOT NULL,
                \`mute\` tinyint NOT NULL,
                \`pending\` tinyint NOT NULL,
                \`settings\` text NOT NULL,
                \`last_message_id\` varchar(255) NULL,
                \`joined_by\` varchar(255) NULL,
                UNIQUE INDEX \`IDX_bb2bf9386ac443afbbbf9f12d3\` (\`id\`, \`guild_id\`),
                PRIMARY KEY (\`index\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`webhooks\` (
                \`id\` varchar(255) NOT NULL,
                \`type\` int NOT NULL,
                \`name\` varchar(255) NULL,
                \`avatar\` varchar(255) NULL,
                \`token\` varchar(255) NULL,
                \`guild_id\` varchar(255) NULL,
                \`channel_id\` varchar(255) NULL,
                \`application_id\` varchar(255) NULL,
                \`user_id\` varchar(255) NULL,
                \`source_guild_id\` varchar(255) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`stickers\` (
                \`id\` varchar(255) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`description\` varchar(255) NULL,
                \`available\` tinyint NULL,
                \`tags\` varchar(255) NULL,
                \`pack_id\` varchar(255) NULL,
                \`guild_id\` varchar(255) NULL,
                \`user_id\` varchar(255) NULL,
                \`type\` int NOT NULL,
                \`format_type\` int NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`attachments\` (
                \`id\` varchar(255) NOT NULL,
                \`filename\` varchar(255) NOT NULL,
                \`size\` int NOT NULL,
                \`url\` varchar(255) NOT NULL,
                \`proxy_url\` varchar(255) NOT NULL,
                \`height\` int NULL,
                \`width\` int NULL,
                \`content_type\` varchar(255) NULL,
                \`message_id\` varchar(255) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`messages\` (
                \`id\` varchar(255) NOT NULL,
                \`channel_id\` varchar(255) NULL,
                \`guild_id\` varchar(255) NULL,
                \`author_id\` varchar(255) NULL,
                \`member_id\` varchar(255) NULL,
                \`webhook_id\` varchar(255) NULL,
                \`application_id\` varchar(255) NULL,
                \`content\` varchar(255) NULL,
                \`timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`edited_timestamp\` datetime NULL,
                \`tts\` tinyint NULL,
                \`mention_everyone\` tinyint NULL,
                \`embeds\` text NOT NULL,
                \`reactions\` text NOT NULL,
                \`nonce\` text NULL,
                \`pinned\` tinyint NULL,
                \`type\` int NOT NULL,
                \`activity\` text NULL,
                \`flags\` varchar(255) NULL,
                \`message_reference\` text NULL,
                \`interaction\` text NULL,
                \`components\` text NULL,
                \`message_reference_id\` varchar(255) NULL,
                INDEX \`IDX_86b9109b155eb70c0a2ca3b4b6\` (\`channel_id\`),
                INDEX \`IDX_05535bc695e9f7ee104616459d\` (\`author_id\`),
                UNIQUE INDEX \`IDX_3ed7a60fb7dbe04e1ba9332a8b\` (\`channel_id\`, \`id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`read_states\` (
                \`id\` varchar(255) NOT NULL,
                \`channel_id\` varchar(255) NOT NULL,
                \`user_id\` varchar(255) NOT NULL,
                \`last_message_id\` varchar(255) NULL,
                \`public_ack\` varchar(255) NULL,
                \`notifications_cursor\` varchar(255) NULL,
                \`last_pin_timestamp\` datetime NULL,
                \`mention_count\` int NULL,
                UNIQUE INDEX \`IDX_0abf8b443321bd3cf7f81ee17a\` (\`channel_id\`, \`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`invites\` (
                \`code\` varchar(255) NOT NULL,
                \`temporary\` tinyint NOT NULL,
                \`uses\` int NOT NULL,
                \`max_uses\` int NOT NULL,
                \`max_age\` int NOT NULL,
                \`created_at\` datetime NOT NULL,
                \`expires_at\` datetime NOT NULL,
                \`guild_id\` varchar(255) NULL,
                \`channel_id\` varchar(255) NULL,
                \`inviter_id\` varchar(255) NULL,
                \`target_user_id\` varchar(255) NULL,
                \`target_user_type\` int NULL,
                \`vanity_url\` tinyint NULL,
                PRIMARY KEY (\`code\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`voice_states\` (
                \`id\` varchar(255) NOT NULL,
                \`guild_id\` varchar(255) NULL,
                \`channel_id\` varchar(255) NULL,
                \`user_id\` varchar(255) NULL,
                \`session_id\` varchar(255) NOT NULL,
                \`token\` varchar(255) NULL,
                \`deaf\` tinyint NOT NULL,
                \`mute\` tinyint NOT NULL,
                \`self_deaf\` tinyint NOT NULL,
                \`self_mute\` tinyint NOT NULL,
                \`self_stream\` tinyint NULL,
                \`self_video\` tinyint NOT NULL,
                \`suppress\` tinyint NOT NULL,
                \`request_to_speak_timestamp\` datetime NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`channels\` (
                \`id\` varchar(255) NOT NULL,
                \`created_at\` datetime NOT NULL,
                \`name\` varchar(255) NULL,
                \`icon\` text NULL,
                \`type\` int NOT NULL,
                \`last_message_id\` varchar(255) NULL,
                \`guild_id\` varchar(255) NULL,
                \`parent_id\` varchar(255) NULL,
                \`owner_id\` varchar(255) NULL,
                \`last_pin_timestamp\` int NULL,
                \`default_auto_archive_duration\` int NULL,
                \`position\` int NULL,
                \`permission_overwrites\` text NULL,
                \`video_quality_mode\` int NULL,
                \`bitrate\` int NULL,
                \`user_limit\` int NULL,
                \`nsfw\` tinyint NULL,
                \`rate_limit_per_user\` int NULL,
                \`topic\` varchar(255) NULL,
                \`retention_policy_id\` varchar(255) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`emojis\` (
                \`id\` varchar(255) NOT NULL,
                \`animated\` tinyint NOT NULL,
                \`available\` tinyint NOT NULL,
                \`guild_id\` varchar(255) NOT NULL,
                \`user_id\` varchar(255) NULL,
                \`managed\` tinyint NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`require_colons\` tinyint NOT NULL,
                \`roles\` text NOT NULL,
                \`groups\` text NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`templates\` (
                \`id\` varchar(255) NOT NULL,
                \`code\` varchar(255) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`description\` varchar(255) NULL,
                \`usage_count\` int NULL,
                \`creator_id\` varchar(255) NULL,
                \`created_at\` datetime NOT NULL,
                \`updated_at\` datetime NOT NULL,
                \`source_guild_id\` varchar(255) NULL,
                \`serialized_source_guild\` text NOT NULL,
                UNIQUE INDEX \`IDX_be38737bf339baf63b1daeffb5\` (\`code\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`guilds\` (
                \`id\` varchar(255) NOT NULL,
                \`afk_channel_id\` varchar(255) NULL,
                \`afk_timeout\` int NULL,
                \`banner\` varchar(255) NULL,
                \`default_message_notifications\` int NULL,
                \`description\` varchar(255) NULL,
                \`discovery_splash\` varchar(255) NULL,
                \`explicit_content_filter\` int NULL,
                \`features\` text NOT NULL,
                \`primary_category_id\` int NULL,
                \`icon\` varchar(255) NULL,
                \`large\` tinyint NULL,
                \`max_members\` int NULL,
                \`max_presences\` int NULL,
                \`max_video_channel_users\` int NULL,
                \`member_count\` int NULL,
                \`presence_count\` int NULL,
                \`template_id\` varchar(255) NULL,
                \`mfa_level\` int NULL,
                \`name\` varchar(255) NOT NULL,
                \`owner_id\` varchar(255) NULL,
                \`preferred_locale\` varchar(255) NULL,
                \`premium_subscription_count\` int NULL,
                \`premium_tier\` int NULL,
                \`public_updates_channel_id\` varchar(255) NULL,
                \`rules_channel_id\` varchar(255) NULL,
                \`region\` varchar(255) NULL,
                \`splash\` varchar(255) NULL,
                \`system_channel_id\` varchar(255) NULL,
                \`system_channel_flags\` int NULL,
                \`unavailable\` tinyint NULL,
                \`verification_level\` int NULL,
                \`welcome_screen\` text NOT NULL,
                \`widget_channel_id\` varchar(255) NULL,
                \`widget_enabled\` tinyint NULL,
                \`nsfw_level\` int NULL,
                \`nsfw\` tinyint NULL,
                \`parent\` varchar(255) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`team_members\` (
                \`id\` varchar(255) NOT NULL,
                \`membership_state\` int NOT NULL,
                \`permissions\` text NOT NULL,
                \`team_id\` varchar(255) NULL,
                \`user_id\` varchar(255) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`teams\` (
                \`id\` varchar(255) NOT NULL,
                \`icon\` varchar(255) NULL,
                \`name\` varchar(255) NOT NULL,
                \`owner_user_id\` varchar(255) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`applications\` (
                \`id\` varchar(255) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`icon\` varchar(255) NULL,
                \`description\` varchar(255) NOT NULL,
                \`rpc_origins\` text NULL,
                \`bot_public\` tinyint NOT NULL,
                \`bot_require_code_grant\` tinyint NOT NULL,
                \`terms_of_service_url\` varchar(255) NULL,
                \`privacy_policy_url\` varchar(255) NULL,
                \`summary\` varchar(255) NULL,
                \`verify_key\` varchar(255) NOT NULL,
                \`primary_sku_id\` varchar(255) NULL,
                \`slug\` varchar(255) NULL,
                \`cover_image\` varchar(255) NULL,
                \`flags\` varchar(255) NOT NULL,
                \`owner_id\` varchar(255) NULL,
                \`team_id\` varchar(255) NULL,
                \`guild_id\` varchar(255) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`audit_logs\` (
                \`id\` varchar(255) NOT NULL,
                \`user_id\` varchar(255) NULL,
                \`action_type\` int NOT NULL,
                \`options\` text NULL,
                \`changes\` text NOT NULL,
                \`reason\` varchar(255) NULL,
                \`target_id\` varchar(255) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`categories\` (
                \`id\` int NOT NULL,
                \`name\` varchar(255) NULL,
                \`localizations\` text NOT NULL,
                \`is_primary\` tinyint NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`rate_limits\` (
                \`id\` varchar(255) NOT NULL,
                \`executor_id\` varchar(255) NOT NULL,
                \`hits\` int NOT NULL,
                \`blocked\` tinyint NOT NULL,
                \`expires_at\` datetime NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`sessions\` (
                \`id\` varchar(255) NOT NULL,
                \`user_id\` varchar(255) NULL,
                \`session_id\` varchar(255) NOT NULL,
                \`activities\` text NULL,
                \`client_info\` text NOT NULL,
                \`status\` varchar(255) NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`sticker_packs\` (
                \`id\` varchar(255) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`description\` varchar(255) NULL,
                \`banner_asset_id\` varchar(255) NULL,
                \`cover_sticker_id\` varchar(255) NULL,
                \`coverStickerId\` varchar(255) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`client_release\` (
                \`id\` varchar(255) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`pub_date\` varchar(255) NOT NULL,
                \`url\` varchar(255) NOT NULL,
                \`deb_url\` varchar(255) NOT NULL,
                \`osx_url\` varchar(255) NOT NULL,
                \`win_url\` varchar(255) NOT NULL,
                \`notes\` varchar(255) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`notes\` (
                \`id\` varchar(255) NOT NULL,
                \`content\` varchar(255) NOT NULL,
                \`owner_id\` varchar(255) NULL,
                \`target_id\` varchar(255) NULL,
                UNIQUE INDEX \`IDX_74e6689b9568cc965b8bfc9150\` (\`owner_id\`, \`target_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`member_roles\` (
                \`index\` int NOT NULL,
                \`role_id\` varchar(255) NOT NULL,
                INDEX \`IDX_5d7ddc8a5f9c167f548625e772\` (\`index\`),
                INDEX \`IDX_e9080e7a7997a0170026d5139c\` (\`role_id\`),
                PRIMARY KEY (\`index\`, \`role_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`message_user_mentions\` (
                \`messagesId\` varchar(255) NOT NULL,
                \`usersId\` varchar(255) NOT NULL,
                INDEX \`IDX_a343387fc560ef378760681c23\` (\`messagesId\`),
                INDEX \`IDX_b831eb18ceebd28976239b1e2f\` (\`usersId\`),
                PRIMARY KEY (\`messagesId\`, \`usersId\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`message_role_mentions\` (
                \`messagesId\` varchar(255) NOT NULL,
                \`rolesId\` varchar(255) NOT NULL,
                INDEX \`IDX_a8242cf535337a490b0feaea0b\` (\`messagesId\`),
                INDEX \`IDX_29d63eb1a458200851bc37d074\` (\`rolesId\`),
                PRIMARY KEY (\`messagesId\`, \`rolesId\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`message_channel_mentions\` (
                \`messagesId\` varchar(255) NOT NULL,
                \`channelsId\` varchar(255) NOT NULL,
                INDEX \`IDX_2a27102ecd1d81b4582a436092\` (\`messagesId\`),
                INDEX \`IDX_bdb8c09e1464cabf62105bf4b9\` (\`channelsId\`),
                PRIMARY KEY (\`messagesId\`, \`channelsId\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`message_stickers\` (
                \`messagesId\` varchar(255) NOT NULL,
                \`stickersId\` varchar(255) NOT NULL,
                INDEX \`IDX_40bb6f23e7cc133292e92829d2\` (\`messagesId\`),
                INDEX \`IDX_e22a70819d07659c7a71c112a1\` (\`stickersId\`),
                PRIMARY KEY (\`messagesId\`, \`stickersId\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`relationships\`
            ADD CONSTRAINT \`FK_9af4194bab1250b1c584ae4f1d7\` FOREIGN KEY (\`from_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`relationships\`
            ADD CONSTRAINT \`FK_9c7f6b98a9843b76dce1b0c878b\` FOREIGN KEY (\`to_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`connected_accounts\`
            ADD CONSTRAINT \`FK_f47244225a6a1eac04a3463dd90\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`backup_codes\`
            ADD CONSTRAINT \`FK_70066ea80d2f4b871beda32633b\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`bans\`
            ADD CONSTRAINT \`FK_5999e8e449f80a236ff72023559\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`bans\`
            ADD CONSTRAINT \`FK_9d3ab7dd180ebdd245cdb66ecad\` FOREIGN KEY (\`guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`bans\`
            ADD CONSTRAINT \`FK_07ad88c86d1f290d46748410d58\` FOREIGN KEY (\`executor_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`recipients\`
            ADD CONSTRAINT \`FK_2f18ee1ba667f233ae86c0ea60e\` FOREIGN KEY (\`channel_id\`) REFERENCES \`channels\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`recipients\`
            ADD CONSTRAINT \`FK_6157e8b6ba4e6e3089616481fe2\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`roles\`
            ADD CONSTRAINT \`FK_c32c1ab1c4dc7dcb0278c4b1b8b\` FOREIGN KEY (\`guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`members\`
            ADD CONSTRAINT \`FK_28b53062261b996d9c99fa12404\` FOREIGN KEY (\`id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`members\`
            ADD CONSTRAINT \`FK_16aceddd5b89825b8ed6029ad1c\` FOREIGN KEY (\`guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`webhooks\`
            ADD CONSTRAINT \`FK_487a7af59d189f744fe394368fc\` FOREIGN KEY (\`guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`webhooks\`
            ADD CONSTRAINT \`FK_df528cf77e82f8032230e7e37d8\` FOREIGN KEY (\`channel_id\`) REFERENCES \`channels\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`webhooks\`
            ADD CONSTRAINT \`FK_c3e5305461931763b56aa905f1c\` FOREIGN KEY (\`application_id\`) REFERENCES \`applications\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`webhooks\`
            ADD CONSTRAINT \`FK_0d523f6f997c86e052c49b1455f\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`webhooks\`
            ADD CONSTRAINT \`FK_3a285f4f49c40e0706d3018bc9f\` FOREIGN KEY (\`source_guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`stickers\`
            ADD CONSTRAINT \`FK_e7cfa5cefa6661b3fb8fda8ce69\` FOREIGN KEY (\`pack_id\`) REFERENCES \`sticker_packs\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`stickers\`
            ADD CONSTRAINT \`FK_193d551d852aca5347ef5c9f205\` FOREIGN KEY (\`guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`stickers\`
            ADD CONSTRAINT \`FK_8f4ee73f2bb2325ff980502e158\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`attachments\`
            ADD CONSTRAINT \`FK_623e10eec51ada466c5038979e3\` FOREIGN KEY (\`message_id\`) REFERENCES \`messages\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\`
            ADD CONSTRAINT \`FK_86b9109b155eb70c0a2ca3b4b6d\` FOREIGN KEY (\`channel_id\`) REFERENCES \`channels\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\`
            ADD CONSTRAINT \`FK_b193588441b085352a4c0109423\` FOREIGN KEY (\`guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\`
            ADD CONSTRAINT \`FK_05535bc695e9f7ee104616459d3\` FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\`
            ADD CONSTRAINT \`FK_b0525304f2262b7014245351c76\` FOREIGN KEY (\`member_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\`
            ADD CONSTRAINT \`FK_f83c04bcf1df4e5c0e7a52ed348\` FOREIGN KEY (\`webhook_id\`) REFERENCES \`webhooks\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\`
            ADD CONSTRAINT \`FK_5d3ec1cb962de6488637fd779d6\` FOREIGN KEY (\`application_id\`) REFERENCES \`applications\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\`
            ADD CONSTRAINT \`FK_61a92bb65b302a76d9c1fcd3174\` FOREIGN KEY (\`message_reference_id\`) REFERENCES \`messages\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`read_states\`
            ADD CONSTRAINT \`FK_40da2fca4e0eaf7a23b5bfc5d34\` FOREIGN KEY (\`channel_id\`) REFERENCES \`channels\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`read_states\`
            ADD CONSTRAINT \`FK_195f92e4dd1254a4e348c043763\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`invites\`
            ADD CONSTRAINT \`FK_3f4939aa1461e8af57fea3fb05d\` FOREIGN KEY (\`guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`invites\`
            ADD CONSTRAINT \`FK_6a15b051fe5050aa00a4b9ff0f6\` FOREIGN KEY (\`channel_id\`) REFERENCES \`channels\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`invites\`
            ADD CONSTRAINT \`FK_15c35422032e0b22b4ada95f48f\` FOREIGN KEY (\`inviter_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`invites\`
            ADD CONSTRAINT \`FK_11a0d394f8fc649c19ce5f16b59\` FOREIGN KEY (\`target_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`voice_states\`
            ADD CONSTRAINT \`FK_03779ef216d4b0358470d9cb748\` FOREIGN KEY (\`guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`voice_states\`
            ADD CONSTRAINT \`FK_9f8d389866b40b6657edd026dd4\` FOREIGN KEY (\`channel_id\`) REFERENCES \`channels\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`voice_states\`
            ADD CONSTRAINT \`FK_5fe1d5f931a67e85039c640001b\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`channels\`
            ADD CONSTRAINT \`FK_c253dafe5f3a03ec00cd8fb4581\` FOREIGN KEY (\`guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`channels\`
            ADD CONSTRAINT \`FK_3274522d14af40540b1a883fc80\` FOREIGN KEY (\`parent_id\`) REFERENCES \`channels\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`channels\`
            ADD CONSTRAINT \`FK_3873ed438575cce703ecff4fc7b\` FOREIGN KEY (\`owner_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`emojis\`
            ADD CONSTRAINT \`FK_4b988e0db89d94cebcf07f598cc\` FOREIGN KEY (\`guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`emojis\`
            ADD CONSTRAINT \`FK_fa7ddd5f9a214e28ce596548421\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`templates\`
            ADD CONSTRAINT \`FK_d7374b7f8f5fbfdececa4fb62e1\` FOREIGN KEY (\`creator_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`templates\`
            ADD CONSTRAINT \`FK_445d00eaaea0e60a017a5ed0c11\` FOREIGN KEY (\`source_guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`guilds\`
            ADD CONSTRAINT \`FK_f591a66b8019d87b0fe6c12dad6\` FOREIGN KEY (\`afk_channel_id\`) REFERENCES \`channels\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`guilds\`
            ADD CONSTRAINT \`FK_e2a2f873a64a5cf62526de42325\` FOREIGN KEY (\`template_id\`) REFERENCES \`templates\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`guilds\`
            ADD CONSTRAINT \`FK_fc1a451727e3643ca572a3bb394\` FOREIGN KEY (\`owner_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`guilds\`
            ADD CONSTRAINT \`FK_8d450b016dc8bec35f36729e4b0\` FOREIGN KEY (\`public_updates_channel_id\`) REFERENCES \`channels\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`guilds\`
            ADD CONSTRAINT \`FK_95828668aa333460582e0ca6396\` FOREIGN KEY (\`rules_channel_id\`) REFERENCES \`channels\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`guilds\`
            ADD CONSTRAINT \`FK_cfc3d3ad260f8121c95b31a1fce\` FOREIGN KEY (\`system_channel_id\`) REFERENCES \`channels\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`guilds\`
            ADD CONSTRAINT \`FK_9d1d665379eefde7876a17afa99\` FOREIGN KEY (\`widget_channel_id\`) REFERENCES \`channels\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`team_members\`
            ADD CONSTRAINT \`FK_fdad7d5768277e60c40e01cdcea\` FOREIGN KEY (\`team_id\`) REFERENCES \`teams\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`team_members\`
            ADD CONSTRAINT \`FK_c2bf4967c8c2a6b845dadfbf3d4\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`teams\`
            ADD CONSTRAINT \`FK_13f00abf7cb6096c43ecaf8c108\` FOREIGN KEY (\`owner_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD CONSTRAINT \`FK_e57508958bf92b9d9d25231b5e8\` FOREIGN KEY (\`owner_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD CONSTRAINT \`FK_a36ed02953077f408d0f3ebc424\` FOREIGN KEY (\`team_id\`) REFERENCES \`teams\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\`
            ADD CONSTRAINT \`FK_e5bf78cdbbe9ba91062d74c5aba\` FOREIGN KEY (\`guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`audit_logs\`
            ADD CONSTRAINT \`FK_3cd01cd3ae7aab010310d96ac8e\` FOREIGN KEY (\`target_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`audit_logs\`
            ADD CONSTRAINT \`FK_bd2726fd31b35443f2245b93ba0\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`sessions\`
            ADD CONSTRAINT \`FK_085d540d9f418cfbdc7bd55bb19\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`sticker_packs\`
            ADD CONSTRAINT \`FK_448fafba4355ee1c837bbc865f1\` FOREIGN KEY (\`coverStickerId\`) REFERENCES \`stickers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`notes\`
            ADD CONSTRAINT \`FK_f9e103f8ae67cb1787063597925\` FOREIGN KEY (\`owner_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`notes\`
            ADD CONSTRAINT \`FK_23e08e5b4481711d573e1abecdc\` FOREIGN KEY (\`target_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`member_roles\`
            ADD CONSTRAINT \`FK_5d7ddc8a5f9c167f548625e772e\` FOREIGN KEY (\`index\`) REFERENCES \`members\`(\`index\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`member_roles\`
            ADD CONSTRAINT \`FK_e9080e7a7997a0170026d5139c1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_user_mentions\`
            ADD CONSTRAINT \`FK_a343387fc560ef378760681c236\` FOREIGN KEY (\`messagesId\`) REFERENCES \`messages\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_user_mentions\`
            ADD CONSTRAINT \`FK_b831eb18ceebd28976239b1e2f8\` FOREIGN KEY (\`usersId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_role_mentions\`
            ADD CONSTRAINT \`FK_a8242cf535337a490b0feaea0b4\` FOREIGN KEY (\`messagesId\`) REFERENCES \`messages\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_role_mentions\`
            ADD CONSTRAINT \`FK_29d63eb1a458200851bc37d074b\` FOREIGN KEY (\`rolesId\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_channel_mentions\`
            ADD CONSTRAINT \`FK_2a27102ecd1d81b4582a4360921\` FOREIGN KEY (\`messagesId\`) REFERENCES \`messages\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_channel_mentions\`
            ADD CONSTRAINT \`FK_bdb8c09e1464cabf62105bf4b9d\` FOREIGN KEY (\`channelsId\`) REFERENCES \`channels\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_stickers\`
            ADD CONSTRAINT \`FK_40bb6f23e7cc133292e92829d28\` FOREIGN KEY (\`messagesId\`) REFERENCES \`messages\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_stickers\`
            ADD CONSTRAINT \`FK_e22a70819d07659c7a71c112a1f\` FOREIGN KEY (\`stickersId\`) REFERENCES \`stickers\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            CREATE TABLE \`query-result-cache\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`identifier\` varchar(255) NULL,
                \`time\` bigint NOT NULL,
                \`duration\` int NOT NULL,
                \`query\` text NOT NULL,
                \`result\` text NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE \`query-result-cache\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_stickers\` DROP FOREIGN KEY \`FK_e22a70819d07659c7a71c112a1f\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_stickers\` DROP FOREIGN KEY \`FK_40bb6f23e7cc133292e92829d28\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_channel_mentions\` DROP FOREIGN KEY \`FK_bdb8c09e1464cabf62105bf4b9d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_channel_mentions\` DROP FOREIGN KEY \`FK_2a27102ecd1d81b4582a4360921\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_role_mentions\` DROP FOREIGN KEY \`FK_29d63eb1a458200851bc37d074b\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_role_mentions\` DROP FOREIGN KEY \`FK_a8242cf535337a490b0feaea0b4\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_user_mentions\` DROP FOREIGN KEY \`FK_b831eb18ceebd28976239b1e2f8\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_user_mentions\` DROP FOREIGN KEY \`FK_a343387fc560ef378760681c236\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`member_roles\` DROP FOREIGN KEY \`FK_e9080e7a7997a0170026d5139c1\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`member_roles\` DROP FOREIGN KEY \`FK_5d7ddc8a5f9c167f548625e772e\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`notes\` DROP FOREIGN KEY \`FK_23e08e5b4481711d573e1abecdc\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`notes\` DROP FOREIGN KEY \`FK_f9e103f8ae67cb1787063597925\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`sticker_packs\` DROP FOREIGN KEY \`FK_448fafba4355ee1c837bbc865f1\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`sessions\` DROP FOREIGN KEY \`FK_085d540d9f418cfbdc7bd55bb19\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`audit_logs\` DROP FOREIGN KEY \`FK_bd2726fd31b35443f2245b93ba0\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`audit_logs\` DROP FOREIGN KEY \`FK_3cd01cd3ae7aab010310d96ac8e\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP FOREIGN KEY \`FK_e5bf78cdbbe9ba91062d74c5aba\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP FOREIGN KEY \`FK_a36ed02953077f408d0f3ebc424\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`applications\` DROP FOREIGN KEY \`FK_e57508958bf92b9d9d25231b5e8\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teams\` DROP FOREIGN KEY \`FK_13f00abf7cb6096c43ecaf8c108\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`team_members\` DROP FOREIGN KEY \`FK_c2bf4967c8c2a6b845dadfbf3d4\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`team_members\` DROP FOREIGN KEY \`FK_fdad7d5768277e60c40e01cdcea\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`guilds\` DROP FOREIGN KEY \`FK_9d1d665379eefde7876a17afa99\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`guilds\` DROP FOREIGN KEY \`FK_cfc3d3ad260f8121c95b31a1fce\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`guilds\` DROP FOREIGN KEY \`FK_95828668aa333460582e0ca6396\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`guilds\` DROP FOREIGN KEY \`FK_8d450b016dc8bec35f36729e4b0\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`guilds\` DROP FOREIGN KEY \`FK_fc1a451727e3643ca572a3bb394\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`guilds\` DROP FOREIGN KEY \`FK_e2a2f873a64a5cf62526de42325\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`guilds\` DROP FOREIGN KEY \`FK_f591a66b8019d87b0fe6c12dad6\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`templates\` DROP FOREIGN KEY \`FK_445d00eaaea0e60a017a5ed0c11\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`templates\` DROP FOREIGN KEY \`FK_d7374b7f8f5fbfdececa4fb62e1\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`emojis\` DROP FOREIGN KEY \`FK_fa7ddd5f9a214e28ce596548421\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`emojis\` DROP FOREIGN KEY \`FK_4b988e0db89d94cebcf07f598cc\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`channels\` DROP FOREIGN KEY \`FK_3873ed438575cce703ecff4fc7b\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`channels\` DROP FOREIGN KEY \`FK_3274522d14af40540b1a883fc80\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`channels\` DROP FOREIGN KEY \`FK_c253dafe5f3a03ec00cd8fb4581\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`voice_states\` DROP FOREIGN KEY \`FK_5fe1d5f931a67e85039c640001b\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`voice_states\` DROP FOREIGN KEY \`FK_9f8d389866b40b6657edd026dd4\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`voice_states\` DROP FOREIGN KEY \`FK_03779ef216d4b0358470d9cb748\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`invites\` DROP FOREIGN KEY \`FK_11a0d394f8fc649c19ce5f16b59\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`invites\` DROP FOREIGN KEY \`FK_15c35422032e0b22b4ada95f48f\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`invites\` DROP FOREIGN KEY \`FK_6a15b051fe5050aa00a4b9ff0f6\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`invites\` DROP FOREIGN KEY \`FK_3f4939aa1461e8af57fea3fb05d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`read_states\` DROP FOREIGN KEY \`FK_195f92e4dd1254a4e348c043763\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`read_states\` DROP FOREIGN KEY \`FK_40da2fca4e0eaf7a23b5bfc5d34\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_61a92bb65b302a76d9c1fcd3174\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_5d3ec1cb962de6488637fd779d6\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_f83c04bcf1df4e5c0e7a52ed348\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_b0525304f2262b7014245351c76\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_05535bc695e9f7ee104616459d3\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_b193588441b085352a4c0109423\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_86b9109b155eb70c0a2ca3b4b6d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`attachments\` DROP FOREIGN KEY \`FK_623e10eec51ada466c5038979e3\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`stickers\` DROP FOREIGN KEY \`FK_8f4ee73f2bb2325ff980502e158\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`stickers\` DROP FOREIGN KEY \`FK_193d551d852aca5347ef5c9f205\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`stickers\` DROP FOREIGN KEY \`FK_e7cfa5cefa6661b3fb8fda8ce69\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`webhooks\` DROP FOREIGN KEY \`FK_3a285f4f49c40e0706d3018bc9f\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`webhooks\` DROP FOREIGN KEY \`FK_0d523f6f997c86e052c49b1455f\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`webhooks\` DROP FOREIGN KEY \`FK_c3e5305461931763b56aa905f1c\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`webhooks\` DROP FOREIGN KEY \`FK_df528cf77e82f8032230e7e37d8\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`webhooks\` DROP FOREIGN KEY \`FK_487a7af59d189f744fe394368fc\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`members\` DROP FOREIGN KEY \`FK_16aceddd5b89825b8ed6029ad1c\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`members\` DROP FOREIGN KEY \`FK_28b53062261b996d9c99fa12404\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`roles\` DROP FOREIGN KEY \`FK_c32c1ab1c4dc7dcb0278c4b1b8b\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`recipients\` DROP FOREIGN KEY \`FK_6157e8b6ba4e6e3089616481fe2\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`recipients\` DROP FOREIGN KEY \`FK_2f18ee1ba667f233ae86c0ea60e\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bans\` DROP FOREIGN KEY \`FK_07ad88c86d1f290d46748410d58\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bans\` DROP FOREIGN KEY \`FK_9d3ab7dd180ebdd245cdb66ecad\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bans\` DROP FOREIGN KEY \`FK_5999e8e449f80a236ff72023559\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`backup_codes\` DROP FOREIGN KEY \`FK_70066ea80d2f4b871beda32633b\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`connected_accounts\` DROP FOREIGN KEY \`FK_f47244225a6a1eac04a3463dd90\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`relationships\` DROP FOREIGN KEY \`FK_9c7f6b98a9843b76dce1b0c878b\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`relationships\` DROP FOREIGN KEY \`FK_9af4194bab1250b1c584ae4f1d7\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_e22a70819d07659c7a71c112a1\` ON \`message_stickers\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_40bb6f23e7cc133292e92829d2\` ON \`message_stickers\`
        `);
        await queryRunner.query(`
            DROP TABLE \`message_stickers\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_bdb8c09e1464cabf62105bf4b9\` ON \`message_channel_mentions\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_2a27102ecd1d81b4582a436092\` ON \`message_channel_mentions\`
        `);
        await queryRunner.query(`
            DROP TABLE \`message_channel_mentions\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_29d63eb1a458200851bc37d074\` ON \`message_role_mentions\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_a8242cf535337a490b0feaea0b\` ON \`message_role_mentions\`
        `);
        await queryRunner.query(`
            DROP TABLE \`message_role_mentions\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_b831eb18ceebd28976239b1e2f\` ON \`message_user_mentions\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_a343387fc560ef378760681c23\` ON \`message_user_mentions\`
        `);
        await queryRunner.query(`
            DROP TABLE \`message_user_mentions\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_e9080e7a7997a0170026d5139c\` ON \`member_roles\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_5d7ddc8a5f9c167f548625e772\` ON \`member_roles\`
        `);
        await queryRunner.query(`
            DROP TABLE \`member_roles\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_74e6689b9568cc965b8bfc9150\` ON \`notes\`
        `);
        await queryRunner.query(`
            DROP TABLE \`notes\`
        `);
        await queryRunner.query(`
            DROP TABLE \`client_release\`
        `);
        await queryRunner.query(`
            DROP TABLE \`sticker_packs\`
        `);
        await queryRunner.query(`
            DROP TABLE \`sessions\`
        `);
        await queryRunner.query(`
            DROP TABLE \`rate_limits\`
        `);
        await queryRunner.query(`
            DROP TABLE \`categories\`
        `);
        await queryRunner.query(`
            DROP TABLE \`audit_logs\`
        `);
        await queryRunner.query(`
            DROP TABLE \`applications\`
        `);
        await queryRunner.query(`
            DROP TABLE \`teams\`
        `);
        await queryRunner.query(`
            DROP TABLE \`team_members\`
        `);
        await queryRunner.query(`
            DROP TABLE \`guilds\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_be38737bf339baf63b1daeffb5\` ON \`templates\`
        `);
        await queryRunner.query(`
            DROP TABLE \`templates\`
        `);
        await queryRunner.query(`
            DROP TABLE \`emojis\`
        `);
        await queryRunner.query(`
            DROP TABLE \`channels\`
        `);
        await queryRunner.query(`
            DROP TABLE \`voice_states\`
        `);
        await queryRunner.query(`
            DROP TABLE \`invites\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_0abf8b443321bd3cf7f81ee17a\` ON \`read_states\`
        `);
        await queryRunner.query(`
            DROP TABLE \`read_states\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_3ed7a60fb7dbe04e1ba9332a8b\` ON \`messages\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_05535bc695e9f7ee104616459d\` ON \`messages\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_86b9109b155eb70c0a2ca3b4b6\` ON \`messages\`
        `);
        await queryRunner.query(`
            DROP TABLE \`messages\`
        `);
        await queryRunner.query(`
            DROP TABLE \`attachments\`
        `);
        await queryRunner.query(`
            DROP TABLE \`stickers\`
        `);
        await queryRunner.query(`
            DROP TABLE \`webhooks\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_bb2bf9386ac443afbbbf9f12d3\` ON \`members\`
        `);
        await queryRunner.query(`
            DROP TABLE \`members\`
        `);
        await queryRunner.query(`
            DROP TABLE \`roles\`
        `);
        await queryRunner.query(`
            DROP TABLE \`recipients\`
        `);
        await queryRunner.query(`
            DROP TABLE \`bans\`
        `);
        await queryRunner.query(`
            DROP TABLE \`backup_codes\`
        `);
        await queryRunner.query(`
            DROP TABLE \`users\`
        `);
        await queryRunner.query(`
            DROP TABLE \`connected_accounts\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_a0b2ff0a598df0b0d055934a17\` ON \`relationships\`
        `);
        await queryRunner.query(`
            DROP TABLE \`relationships\`
        `);
        await queryRunner.query(`
            DROP TABLE \`config\`
        `);
    }

}
