import { MigrationInterface, QueryRunner } from "typeorm";

export class AttachmentMetadata1787497429170 implements MigrationInterface {
    name = "AttachmentMetadata1787497429170";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attachments" ADD "description" character varying`);
        await queryRunner.query(`ALTER TABLE "attachments" ADD "flags" smallint`);
        await queryRunner.query(`ALTER TABLE "attachments" ADD "content_scan_version" smallint`);
        await queryRunner.query(`ALTER TABLE "attachments" ADD "placeholder_version" smallint`);
        await queryRunner.query(`ALTER TABLE "attachments" ADD "placeholder" character varying`);
        await queryRunner.query(`ALTER TABLE "attachments" ADD "duration_secs" double precision`);
        await queryRunner.query(`ALTER TABLE "attachments" ADD "waveform" character varying`);
        await queryRunner.query(`ALTER TABLE "attachments" ADD "title" character varying`);
        await queryRunner.query(`ALTER TABLE "attachments" ADD "clip_created_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attachments" DROP COLUMN "clip_created_at"`);
        await queryRunner.query(`ALTER TABLE "attachments" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "attachments" DROP COLUMN "waveform"`);
        await queryRunner.query(`ALTER TABLE "attachments" DROP COLUMN "duration_secs"`);
        await queryRunner.query(`ALTER TABLE "attachments" DROP COLUMN "placeholder"`);
        await queryRunner.query(`ALTER TABLE "attachments" DROP COLUMN "placeholder_version"`);
        await queryRunner.query(`ALTER TABLE "attachments" DROP COLUMN "content_scan_version"`);
        await queryRunner.query(`ALTER TABLE "attachments" DROP COLUMN "flags"`);
        await queryRunner.query(`ALTER TABLE "attachments" DROP COLUMN "description"`);
    }
}
