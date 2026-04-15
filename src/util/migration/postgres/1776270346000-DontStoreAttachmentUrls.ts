import { MigrationInterface, QueryRunner } from "typeorm";

export class DontStoreAttachmentUrls1776270346000 implements MigrationInterface {
    name = "DontStoreAttachmentUrls1776270346000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "jsonb");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "varchar");
    }

    private async convertPks(queryRunner: QueryRunner, to: string) {
        await queryRunner.query(`ALTER TABLE attachments ADD channel_id int8 NULL;`);
        await queryRunner.query(`ALTER TABLE attachments ADD CONSTRAINT attachments_channels_fk FOREIGN KEY (channel_id) REFERENCES public.channels(id) ON DELETE CASCADE;`);
        await queryRunner.query(`UPDATE attachments att SET channel_id = (SELECT channel_id FROM messages WHERE id = att.message_id) WHERE message_id IS NOT NULL;`);
        await queryRunner.query(`ALTER TABLE attachments DROP COLUMN url;`);
        await queryRunner.query(`ALTER TABLE attachments DROP COLUMN proxy_url;`);
    }
}
