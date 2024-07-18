import { MigrationInterface, QueryRunner } from "typeorm";

export class MessagePollObject1720157926878 implements MigrationInterface {
	name = "MessagePollObject1720157926878";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("ALTER TABLE `messages` ADD `poll` text NULL");
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("ALTER TABLE `messages` DROP COLUMN `poll`");
	}
}
