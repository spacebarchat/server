import { MigrationInterface, QueryRunner } from "typeorm";

export class ChannelStatus1772404321401 implements MigrationInterface {
    name = "ChannelStatus1772404321401";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "channels" ADD "status" text NULL;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "channels" DROP COLUMN "status"`);
    }
}
