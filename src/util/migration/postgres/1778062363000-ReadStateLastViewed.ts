import { MigrationInterface, QueryRunner } from "typeorm";

export class ReadStateLastViewed1778062363000 implements MigrationInterface {
    name = "ReadStateLastViewed1778062363000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "read_states" ADD "last_viewed" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "read_states" DROP COLUMN "last_viewed"`);
    }
}
