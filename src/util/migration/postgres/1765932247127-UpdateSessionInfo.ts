import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSessionInfo1765932247127 implements MigrationInterface {
    name = 'UpdateSessionInfo1765932247127'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "last_seen_location_info" text`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "session_nickname" character varying`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "last_seen" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "last_seen" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "last_seen_ip" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "last_seen_ip" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "last_seen_ip" SET DEFAULT '127.0.0.1'`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "last_seen_ip" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "last_seen" SET DEFAULT '1970-01-01 00:00:00'`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "last_seen" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "session_nickname"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "last_seen_location_info"`);
    }

}
