import { MigrationInterface, QueryRunner } from "typeorm";

export class NullableTags1770310028511 implements MigrationInterface {
    name = "NullableTags1770310028511";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tags" ALTER COLUMN "emoji_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tags" ALTER COLUMN "emoji_name" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tags" ALTER COLUMN "emoji_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tags" ALTER COLUMN "emoji_id" SET NOT NULL`);
    }
}
