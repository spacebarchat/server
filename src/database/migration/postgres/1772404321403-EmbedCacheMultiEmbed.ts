import { MigrationInterface, QueryRunner } from "typeorm";

export class EmbedCacheCreatedAt1772404321403 implements MigrationInterface {
    name = "EmbedCacheCreatedAt1772404321403";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "embed_cache" ALTER COLUMN "embed" DROP NOT NULL;`);
        await queryRunner.query(`ALTER TABLE "embed_cache" ADD "embeds" text NULL;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "embed_cache" DROP COLUMN "embeds"`);
        await queryRunner.query(`UPDATE "embed_cache" SET "embed" = '{}' WHERE "embed" IS NULL;`);
        await queryRunner.query(`ALTER TABLE "embed_cache" ALTER COLUMN "embed" SET NOT NULL;`);
    }
}
