import { MigrationInterface, QueryRunner } from "typeorm";

export class JsonbForJsonColumns1776204936000 implements MigrationInterface {
    name = "JsonbForJsonColumns1776204936000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "jsonb");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "varchar");
    }

    private async convertPks(queryRunner: QueryRunner, to: string) {
        await queryRunner.query(`ALTER TABLE application_commands ALTER COLUMN options SET DEFAULT '[]'::jsonb;`);
        await queryRunner.query(`ALTER TABLE application_commands ALTER COLUMN contexts TYPE ${to} USING contexts::${to};`);
        await queryRunner.query(`ALTER TABLE application_commands ALTER COLUMN description_localizations TYPE ${to} USING description_localizations::${to};`);
        await queryRunner.query(`ALTER TABLE application_commands ALTER COLUMN integration_types TYPE ${to} USING integration_types::${to};`);
        await queryRunner.query(`ALTER TABLE application_commands ALTER COLUMN options TYPE ${to} USING options::${to};`);
        await queryRunner.query(`ALTER TABLE application_commands ALTER COLUMN permissions TYPE ${to} USING permissions::${to};`);

        await queryRunner.query(`ALTER TABLE applications ALTER COLUMN "type" TYPE ${to} USING "type"::${to};`);
        await queryRunner.query(`ALTER TABLE applications ALTER COLUMN install_params TYPE ${to} USING install_params::${to};`);

        await queryRunner.query(`ALTER TABLE audit_logs ALTER COLUMN changes TYPE ${to} USING changes::${to};`);
        await queryRunner.query(`ALTER TABLE audit_logs ALTER COLUMN options TYPE ${to} USING options::${to};`);

        await queryRunner.query(`ALTER TABLE automod_rules ALTER COLUMN actions TYPE ${to} USING actions::${to};`);
        await queryRunner.query(`ALTER TABLE automod_rules ALTER COLUMN trigger_metadata TYPE ${to} USING trigger_metadata::${to};`);

        await queryRunner.query(`ALTER TABLE categories ALTER COLUMN localizations TYPE ${to} USING localizations::${to};`);

        await queryRunner.query(`ALTER TABLE channels ALTER COLUMN permission_overwrites TYPE ${to} USING permission_overwrites::${to};`);
        await queryRunner.query(`ALTER TABLE channels ALTER COLUMN thread_metadata TYPE ${to} USING thread_metadata::${to};`);

        await queryRunner.query(`ALTER TABLE connected_accounts ALTER COLUMN metadata TYPE ${to} USING metadata::${to};`);
        await queryRunner.query(`ALTER TABLE connected_accounts ALTER COLUMN token_data TYPE ${to} USING token_data::${to};`);

        await queryRunner.query(`ALTER TABLE embed_cache ALTER COLUMN embed TYPE ${to} USING embed::${to};`);
        await queryRunner.query(`ALTER TABLE embed_cache ALTER COLUMN embeds TYPE ${to} USING embeds::${to};`);

        await queryRunner.query(`ALTER TABLE guilds ALTER COLUMN welcome_screen TYPE ${to} USING welcome_screen::${to};`);

        await queryRunner.query(`ALTER TABLE members ALTER COLUMN avatar_decoration_data TYPE ${to} USING avatar_decoration_data::${to};`);
        await queryRunner.query(`ALTER TABLE members ALTER COLUMN collectibles TYPE ${to} USING collectibles::${to};`);
        await queryRunner.query(`ALTER TABLE members ALTER COLUMN display_name_styles TYPE ${to} USING display_name_styles::${to};`);
        await queryRunner.query(`ALTER TABLE members ALTER COLUMN settings TYPE ${to} USING settings::${to};`);

        await queryRunner.query(`ALTER TABLE messages ALTER COLUMN message_snapshots SET DEFAULT '[]'::jsonb;`);
        await queryRunner.query(`ALTER TABLE messages ALTER COLUMN activity TYPE ${to} USING activity::${to};`);
        await queryRunner.query(`ALTER TABLE messages ALTER COLUMN components TYPE ${to} USING components::${to};`);
        await queryRunner.query(`ALTER TABLE messages ALTER COLUMN embeds TYPE ${to} USING embeds::${to};`);
        await queryRunner.query(`ALTER TABLE messages ALTER COLUMN interaction TYPE ${to} USING interaction::${to};`);
        await queryRunner.query(`ALTER TABLE messages ALTER COLUMN interaction_metadata TYPE ${to} USING interaction_metadata::${to};`);
        await queryRunner.query(`ALTER TABLE messages ALTER COLUMN message_reference TYPE ${to} USING message_reference::${to};`);
        await queryRunner.query(`ALTER TABLE messages ALTER COLUMN message_snapshots TYPE ${to} USING message_snapshots::${to};`);
        await queryRunner.query(`ALTER TABLE messages ALTER COLUMN poll TYPE ${to} USING poll::${to};`);
        await queryRunner.query(`ALTER TABLE messages ALTER COLUMN reactions TYPE ${to} USING reactions::${to};`);

        await queryRunner.query(`ALTER TABLE roles ALTER COLUMN colors TYPE ${to} USING colors::${to};`);
        await queryRunner.query(`ALTER TABLE roles ALTER COLUMN tags TYPE ${to} USING tags::${to};`);

        await queryRunner.query(`ALTER TABLE sessions ALTER COLUMN activities SET DEFAULT '[]'::jsonb;`);
        await queryRunner.query(`ALTER TABLE sessions ALTER COLUMN activities TYPE ${to} USING activities::${to};`);
        await queryRunner.query(`ALTER TABLE sessions ALTER COLUMN client_info TYPE ${to} USING client_info::${to};`);
        await queryRunner.query(`ALTER TABLE sessions ALTER COLUMN client_status TYPE ${to} USING client_status::${to};`);
        await queryRunner.query(`ALTER TABLE sessions ALTER COLUMN last_seen_location_info TYPE ${to} USING last_seen_location_info::${to};`);

        await queryRunner.query(`ALTER TABLE templates ALTER COLUMN serialized_source_guild TYPE ${to} USING serialized_source_guild::${to};`);

        await queryRunner.query(`ALTER TABLE thread_members ALTER COLUMN mute_config TYPE ${to} USING mute_config::${to};`);

        await queryRunner.query(`ALTER TABLE user_settings ALTER COLUMN custom_status TYPE ${to} USING custom_status::${to};`);
        await queryRunner.query(`ALTER TABLE user_settings ALTER COLUMN friend_source_flags TYPE ${to} USING friend_source_flags::${to};`);
        await queryRunner.query(`ALTER TABLE user_settings ALTER COLUMN guild_folders TYPE ${to} USING guild_folders::${to};`);
        await queryRunner.query(`ALTER TABLE user_settings ALTER COLUMN guild_positions TYPE ${to} USING guild_positions::${to};`);
        await queryRunner.query(`ALTER TABLE user_settings ALTER COLUMN restricted_guilds TYPE ${to} USING restricted_guilds::${to};`);

        await queryRunner.query(`ALTER TABLE users ALTER COLUMN avatar_decoration_data TYPE ${to} USING avatar_decoration_data::${to};`);
        await queryRunner.query(`ALTER TABLE users ALTER COLUMN collectibles TYPE ${to} USING collectibles::${to};`);
        await queryRunner.query(`ALTER TABLE users ALTER COLUMN data TYPE ${to} USING data::${to};`);
        await queryRunner.query(`ALTER TABLE users ALTER COLUMN display_name_styles TYPE ${to} USING display_name_styles::${to};`);
        await queryRunner.query(`ALTER TABLE users ALTER COLUMN primary_guild TYPE ${to} USING primary_guild::${to};`);
    }
}
