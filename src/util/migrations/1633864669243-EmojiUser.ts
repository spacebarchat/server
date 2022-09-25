import { MigrationInterface, QueryRunner } from "typeorm";

export class EmojiUser1633864669243 implements MigrationInterface {
	name = "EmojiUser1633864669243";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "emojis" ADD "user_id" varchar`);
		try {
			await queryRunner.query(
				`ALTER TABLE "emojis" ADD CONSTRAINT FK_fa7ddd5f9a214e28ce596548421 FOREIGN KEY (user_id) REFERENCES users(id)`
			);
		} catch (error) {
			console.error(
				"sqlite doesn't support altering foreign keys: https://stackoverflow.com/questions/1884818/how-do-i-add-a-foreign-key-to-an-existing-sqlite-table"
			);
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "emojis" DROP COLUMN column_name "user_id"`);
		await queryRunner.query(`ALTER TABLE "emojis" DROP CONSTRAINT FK_fa7ddd5f9a214e28ce596548421`);
	}
}
