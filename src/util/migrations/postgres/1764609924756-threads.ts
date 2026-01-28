import { MigrationInterface, QueryRunner } from "typeorm";

export class Threads1764609924756 implements MigrationInterface {
    name = "Threads1764609924756";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_bb3af7f695d50083e6523290d41"`);
        await queryRunner.query(`ALTER TABLE "channels" DROP COLUMN "total_message_sent"`);
        await queryRunner.query(`ALTER TABLE "channels" ADD "total_messsage_sent" integer`);
        await queryRunner.query(`ALTER TABLE "channels" ALTER COLUMN "thread_metadata" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "channels" ALTER COLUMN "member_count" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "channels" ALTER COLUMN "message_count" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "channels" ALTER COLUMN "message_count" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "channels" ALTER COLUMN "member_count" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "channels" ALTER COLUMN "thread_metadata" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "channels" DROP COLUMN "total_messsage_sent"`);
        await queryRunner.query(`ALTER TABLE "channels" ADD "total_message_sent" integer NOT NULL`);
        await queryRunner.query(
            `ALTER TABLE "messages" ADD CONSTRAINT "FK_bb3af7f695d50083e6523290d41" FOREIGN KEY ("thread_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }
}
