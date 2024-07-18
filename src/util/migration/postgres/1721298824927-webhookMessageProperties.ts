import { MigrationInterface, QueryRunner } from "typeorm";

export class WebhookMessageProperties1721298824927 implements MigrationInterface {
	name = "WebhookMessageProperties1721298824927";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("ALTER TABLE messages ADD username text NULL");
		await queryRunner.query("ALTER TABLE messages ADD avatar text NULL");
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("ALTER TABLE messages DROP COLUMN username");
		await queryRunner.query("ALTER TABLE messages DROP COLUMN avatar");
	}
}
