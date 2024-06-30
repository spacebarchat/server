import { MigrationInterface, QueryRunner } from "typeorm";

export class NewUserSettings1719776735000 implements MigrationInterface {
	name = "NewUserSettings1719776735000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			"ALTER TABLE `user_settings` ADD friend_discovery_flags integer NULL DEFAULT 0;",
		);
		await queryRunner.query(
			"ALTER TABLE `user_settings` ADD view_nsfw_guilds tinyint NULL DEFAULT 1;",
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			"ALTER TABLE `user_settings` DROP COLUMN friend_discovery_flags;",
		);
		await queryRunner.query(
			"ALTER TABLE `user_settings` DROP COLUMN view_nsfw_guilds;",
		);
	}
}
