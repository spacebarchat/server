import { MigrationInterface, QueryRunner } from "typeorm";

export class LastPinTimestampAsDate1771997061671 implements MigrationInterface {
    name = "LastPinTimestampAsDate1771997061671";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "channels" DROP COLUMN "last_pin_timestamp"`);
        await queryRunner.query(`ALTER TABLE "channels" ADD "last_pin_timestamp" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "channels" DROP COLUMN "last_pin_timestamp"`);
        await queryRunner.query(`ALTER TABLE "channels" ADD "last_pin_timestamp" integer`);
    }
}
