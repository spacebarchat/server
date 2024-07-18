import { MigrationInterface, QueryRunner } from "typeorm";

export class MessageFlagsNotNull1713116476900 implements MigrationInterface {
	name = "MessageFlagsNotNull1713116476900";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			"ALTER TABLE `messages` CHANGE flags flags_old integer;",
		);
		await queryRunner.query(
			"ALTER TABLE `messages` ADD flags integer NOT NULL DEFAULT 0;",
		);
		await queryRunner.query(
			"UPDATE `messages` SET flags = IFNULL(flags_old, 0);",
		);
		await queryRunner.query(
			"ALTER TABLE `messages` DROP COLUMN flags_old;",
		);
	}

	public async down(): Promise<void> {
		// dont care
		throw new Error("Migration down is not implemented.");
	}
}
