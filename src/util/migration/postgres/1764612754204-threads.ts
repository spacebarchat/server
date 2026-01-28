import { MigrationInterface, QueryRunner } from "typeorm";

export class Threads1764612754204 implements MigrationInterface {
    name = "Threads1764612754204";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" ADD "thread_id" character varying`);
        await queryRunner.query(`ALTER TABLE "channels" ADD "thread_metadata" text`);
        await queryRunner.query(`ALTER TABLE "channels" ADD "member_count" integer`);
        await queryRunner.query(`ALTER TABLE "channels" ADD "message_count" integer`);
        await queryRunner.query(`ALTER TABLE "channels" ADD "total_message_sent" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "channels" DROP COLUMN "total_message_sent"`);
        await queryRunner.query(`ALTER TABLE "channels" DROP COLUMN "message_count"`);
        await queryRunner.query(`ALTER TABLE "channels" DROP COLUMN "member_count"`);
        await queryRunner.query(`ALTER TABLE "channels" DROP COLUMN "thread_metadata"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "thread_id"`);
    }
}
