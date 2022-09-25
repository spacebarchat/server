import { MigrationInterface, QueryRunner } from "typeorm";

export class EmojiRoles1633864260873 implements MigrationInterface {
	name = "EmojiRoles1633864260873";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "emojis" ADD "roles" text NOT NULL DEFAULT ''`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "emojis" DROP COLUMN column_name "roles"`);
	}
}
