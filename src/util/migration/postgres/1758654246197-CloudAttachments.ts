import { MigrationInterface, QueryRunner } from "typeorm";

export class CloudAttachments1758654246197 implements MigrationInterface {
    name = 'CloudAttachments1758654246197'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cloud_attachments" ("id" character varying NOT NULL, "user_id" character varying, "channel_id" character varying, "upload_filename" character varying NOT NULL, "user_attachment_id" character varying, "user_filename" character varying NOT NULL, "user_file_size" integer, "user_original_content_type" character varying, "user_is_clip" boolean, "size" integer, "height" integer, "width" integer, "content_type" character varying, "userId" character varying, "channelId" character varying, CONSTRAINT "PK_5794827a3ee7c9318612dcb70c8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cloud_attachments" ADD CONSTRAINT "FK_e6b32df2004e8ad0f488b4a2019" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cloud_attachments" ADD CONSTRAINT "FK_cab965a18f8ca30293bff3d50a8" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cloud_attachments" DROP CONSTRAINT "FK_cab965a18f8ca30293bff3d50a8"`);
        await queryRunner.query(`ALTER TABLE "cloud_attachments" DROP CONSTRAINT "FK_e6b32df2004e8ad0f488b4a2019"`);
        await queryRunner.query(`DROP TABLE "cloud_attachments"`);
    }

}
