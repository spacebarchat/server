import { MigrationInterface, QueryRunner } from "typeorm";

export class Int8Fixes1776283923000 implements MigrationInterface {
    name = "Int8Fixes1776283923000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "int8");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "varchar");
    }

    private async convertPks(queryRunner: QueryRunner, to: string) {
        await queryRunner.query(`ALTER TABLE application_commands ALTER COLUMN "version" SET DEFAULT 0::int8;`);
        await queryRunner.query(`ALTER TABLE application_commands ALTER COLUMN application_id TYPE ${to} USING application_id::${to}`);
        // missing relation
        await queryRunner.query(
            `ALTER TABLE application_commands ADD CONSTRAINT application_commands_applications_fk FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;`,
        );
        await queryRunner.query(`ALTER TABLE application_commands ALTER COLUMN version TYPE ${to} USING version::${to}`);
        await queryRunner.query(`ALTER TABLE automod_rules ALTER COLUMN guild_id TYPE ${to} USING guild_id::${to}`);
        // missing relation
        await queryRunner.query(`ALTER TABLE automod_rules ADD CONSTRAINT automod_rules_guilds_fk FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE channels ALTER COLUMN last_message_id TYPE ${to} USING last_message_id::${to}`);
        await queryRunner.query(`ALTER TABLE guilds ALTER COLUMN primary_category_id TYPE ${to} USING primary_category_id::${to}`);
        // missing relation
        await queryRunner.query(`ALTER TABLE guilds ADD CONSTRAINT guilds_categories_fk FOREIGN KEY (primary_category_id) REFERENCES categories(id) ON DELETE SET NULL;`);
        await queryRunner.query(`ALTER TABLE instance_bans ALTER COLUMN user_id TYPE ${to} USING user_id::${to}`);
        await queryRunner.query(`ALTER TABLE members ALTER COLUMN last_message_id TYPE ${to} USING last_message_id::${to}`);
        // oops
        await queryRunner.query(`UPDATE read_states SET last_message_id = NULL WHERE last_message_id = 'null' OR last_message_id = 'undefined' OR last_message_id ~ 'fake';`);
        await queryRunner.query(`ALTER TABLE read_states ALTER COLUMN last_message_id TYPE ${to} USING last_message_id::${to}`);
        await queryRunner.query(`ALTER TABLE read_states ALTER COLUMN last_acked_id TYPE ${to} USING last_acked_id::${to}`);
        await queryRunner.query(`ALTER TABLE security_settings ALTER COLUMN guild_id TYPE ${to} USING guild_id::${to}`);
        await queryRunner.query(`ALTER TABLE security_settings ALTER COLUMN channel_id TYPE ${to} USING channel_id::${to}`);
        await queryRunner.query(`ALTER TABLE tags ALTER COLUMN emoji_id TYPE ${to} USING emoji_id::${to}`);
    }
}
