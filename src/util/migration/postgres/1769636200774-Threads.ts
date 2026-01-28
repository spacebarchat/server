import { MigrationInterface, QueryRunner } from "typeorm";

export class Threads1769636200774 implements MigrationInterface {
    name = "Threads1769636200774";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" ADD "thread_id" character varying`);
        await queryRunner.query(`ALTER TABLE "channels" ADD "thread_metadata" text`);
        await queryRunner.query(`ALTER TABLE "channels" ADD "member_count" integer`);
        await queryRunner.query(`ALTER TABLE "channels" ADD "message_count" integer`);
        await queryRunner.query(`ALTER TABLE "channels" ADD "total_message_sent" integer`);
        await queryRunner.query(
            `ALTER TABLE "messages" ADD CONSTRAINT "FK_bb3af7f695d50083e6523290d41" FOREIGN KEY ("thread_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_bb3af7f695d50083e6523290d41"`);
        await queryRunner.query(`ALTER TABLE "channels" DROP COLUMN "total_message_sent"`);
        await queryRunner.query(`ALTER TABLE "channels" DROP COLUMN "message_count"`);
        await queryRunner.query(`ALTER TABLE "channels" DROP COLUMN "member_count"`);
        await queryRunner.query(`ALTER TABLE "channels" DROP COLUMN "thread_metadata"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "thread_id"`);
    }
}
