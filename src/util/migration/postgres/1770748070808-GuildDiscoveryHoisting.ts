import { MigrationInterface, QueryRunner } from "typeorm";

export class GuildDiscoveryHoisting1770748070808 implements MigrationInterface {
    name = "GuildDiscoveryHoisting1770748070808";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "guilds" ADD "discovery_weight" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "guilds" ADD "discovery_excluded" boolean NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "guilds" DROP COLUMN "discovery_excluded"`);
        await queryRunner.query(`ALTER TABLE "guilds" DROP COLUMN "discovery_weight"`);
    }
}
