import { MigrationInterface, QueryRunner } from "typeorm";

export class DiscoveryCategoryIcon1723577874393 implements MigrationInterface {
	name = "DiscoveryCategoryIcon1723577874393";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("ALTER TABLE categories ADD icon text NULL");
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("ALTER TABLE categories DROP COLUMN icon");
	}
}
