import { MigrationInterface, QueryRunner } from "typeorm";

export class DefaultGuildChannelOrdering1776450647003 implements MigrationInterface {
    name = "DefaultGuildChannelOrdering1776450647003";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE guilds SET channel_ordering = ARRAY[]::int8[] WHERE channel_ordering IS NULL;`);
        await queryRunner.query(`ALTER TABLE guilds ALTER COLUMN channel_ordering SET DEFAULT ARRAY[]::int8[];`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE guilds ALTER COLUMN channel_ordering DROP DEFAULT;`);
    }
}
