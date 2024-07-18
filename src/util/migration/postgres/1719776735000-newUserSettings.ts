import { MigrationInterface, QueryRunner } from "typeorm";

export class NewUserSettings1719776735000 implements MigrationInterface {
	name = "NewUserSettings1719776735000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			"ALTER TABLE user_settings ADD COLUMN friend_discovery_flags integer DEFAULT 0;",
		);
		await queryRunner.query(
			"ALTER TABLE user_settings ADD COLUMN view_nsfw_guilds boolean DEFAULT true;",
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			"ALTER TABLE user_settings DROP COLUMN friend_discovery_flags;",
		);
		await queryRunner.query(
			"ALTER TABLE user_settings DROP COLUMN view_nsfw_guilds;",
		);
	}
}
