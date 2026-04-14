import { MigrationInterface, QueryRunner } from "typeorm";

export class Int8PrimaryKeys1776178642000 implements MigrationInterface {
    name = "Int8PrimaryKeys1776178642000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "int8");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "varchar");
    }

    private async convertPks(queryRunner: QueryRunner, to: string) {
        // simple changes only
        await queryRunner.query(`ALTER TABLE application_commands ALTER COLUMN id TYPE ${to} USING id::${to};`); // varchar
        // applications -> separate migration
        await queryRunner.query(`ALTER TABLE attachments ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(`ALTER TABLE audit_logs ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(`ALTER TABLE automod_rules ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(`ALTER TABLE backup_codes ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(`ALTER TABLE badges ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(`ALTER TABLE bans ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(`ALTER TABLE categories ALTER COLUMN id TYPE ${to} USING id::${to};`);
        // channels -> separate migration
        await queryRunner.query(`ALTER TABLE client_release ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(`ALTER TABLE cloud_attachments ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(`ALTER TABLE connected_accounts ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(`ALTER TABLE embed_cache ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(`ALTER TABLE emojis ALTER COLUMN id TYPE ${to} USING id::${to};`);
        // guilds -> separate migration
        // instance_bans -> separate migration
        // messages -> separate migration
        await queryRunner.query(`ALTER TABLE notes ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(`ALTER TABLE rate_limits ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(`ALTER TABLE read_states ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(`ALTER TABLE recipients ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(`ALTER TABLE relationships ALTER COLUMN id TYPE ${to} USING id::${to};`);
        // roles -> separate migration
        await queryRunner.query(`ALTER TABLE security_keys ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(`ALTER TABLE security_settings ALTER COLUMN id TYPE ${to} USING id::${to};`);
        // sticker_packs -> separate migration
        // stickers -> separate migration
        await queryRunner.query(`ALTER TABLE stream_sessions ALTER COLUMN id TYPE ${to} USING id::${to};`);
        // streams -> separate migration
        await queryRunner.query(`ALTER TABLE tags ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(`ALTER TABLE team_members ALTER COLUMN id TYPE ${to} USING id::${to};`);
        // teams -> separate migration
        // templates -> separate migration
        // users -> separate migration
        await queryRunner.query(`ALTER TABLE voice_states ALTER COLUMN id TYPE ${to} USING id::${to};`);
        // webhooks -> separate migration
    }
}
