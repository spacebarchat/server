import { MigrationInterface, QueryRunner } from "typeorm";

export class ThreadGoof1764622231800 implements MigrationInterface {
    name = "ThreadGoof1764622231800";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "messages" ADD CONSTRAINT "FK_bb3af7f695d50083e6523290d41" FOREIGN KEY ("thread_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_bb3af7f695d50083e6523290d41"`);
    }
}
