import { MigrationInterface, QueryRunner } from "typeorm";

export class WebhookSourceChannel1723644478176 implements MigrationInterface {
	name = "WebhookSourceChannel1723644478176";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			"ALTER TABLE webhooks ADD COLUMN source_channel_id VARCHAR(255) NULL DEFAULT NULL",
		);
		await queryRunner.query(
			"ALTER TABLE webhooks ADD CONSTRAINT FK_d64f38834fa676f6caa4786ddd6 FOREIGN KEY (source_channel_id) REFERENCES channels (id) ON UPDATE NO ACTION ON DELETE CASCADE",
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			"ALTER TABLE webhooks DROP CONSTRAINT FK_d64f38834fa676f6caa4786ddd6",
		);
		await queryRunner.query(
			"ALTER TABLE webhooks DROP COLUMN source_channel_id",
		);
	}
}
