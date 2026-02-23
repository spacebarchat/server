import { MigrationInterface, QueryRunner } from "typeorm";

export class MoreReadStateFields1771825341528 implements MigrationInterface {
    name = "MoreReadStateFields1771825341528";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "read_states" DROP COLUMN "public_ack"`);
        await queryRunner.query(`ALTER TABLE "read_states" ADD "last_acked_id" character varying`);
        await queryRunner.query(`ALTER TABLE "read_states" ADD "badge_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "read_states" ADD "read_state_type" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "read_states" ADD "flags" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "read_states" ALTER COLUMN "mention_count" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "read_states" ALTER COLUMN "mention_count" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "read_states" ALTER COLUMN "mention_count" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "read_states" ALTER COLUMN "mention_count" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "read_states" DROP COLUMN "flags"`);
        await queryRunner.query(`ALTER TABLE "read_states" DROP COLUMN "read_state_type"`);
        await queryRunner.query(`ALTER TABLE "read_states" DROP COLUMN "badge_count"`);
        await queryRunner.query(`ALTER TABLE "read_states" DROP COLUMN "last_acked_id"`);
        await queryRunner.query(`ALTER TABLE "read_states" ADD "public_ack" character varying`);
    }
}
