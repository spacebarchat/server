import { MigrationInterface, QueryRunner } from "typeorm";

export class MessageSnapshots1765185286988 implements MigrationInterface {
    name = "MessageSnapshots1765185286988";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" ADD "message_snapshots" text NOT NULL DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "message_snapshots"`);
    }
}
