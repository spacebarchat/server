import { MigrationInterface, QueryRunner } from "typeorm";

export class EmbedCacheCreatedAt1772404321402 implements MigrationInterface {
    name = "EmbedCacheCreatedAt1772404321402";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "embed_cache" ADD "created_at" timestamp with time zone DEFAULT now();`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "embed_cache" DROP COLUMN "created_at"`);
    }
}
