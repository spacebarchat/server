import { MigrationInterface, QueryRunner } from "typeorm";

export class GuildChannelOrderingAsArray1776450647000 implements MigrationInterface {
    name = "GuildChannelOrderingAsArray1776450647000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // spacebar was randomly adding json data into CSV values, unwrap them
        await queryRunner.query(`UPDATE guilds SET channel_ordering = REPLACE(channel_ordering, '"', '') WHERE channel_ordering ~ '"';`);
        await queryRunner.query(`UPDATE guilds SET channel_ordering = REPLACE(channel_ordering, '[', '') WHERE channel_ordering ~ '\\[';`);
        await queryRunner.query(`UPDATE guilds SET channel_ordering = REPLACE(channel_ordering, ']', '') WHERE channel_ordering ~ '\\]';`);
        await queryRunner.query(`ALTER TABLE guilds ALTER COLUMN channel_ordering TYPE int8[] USING string_to_array(channel_ordering, ',')::int8[];`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log(`Migration ${this.name}.down() not implemented`);
    }
}
