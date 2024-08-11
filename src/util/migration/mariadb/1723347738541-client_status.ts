import { MigrationInterface, QueryRunner } from "typeorm";

export class client_status1723347738541 implements MigrationInterface {
	name = "client_status1723347738541";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			"ALTER TABLE `sessions` ADD `client_status` text NULL AFTER `client_info`",
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			"ALTER TABLE `sessions` DROP COLUMN `client_status`",
		);
	}
}
