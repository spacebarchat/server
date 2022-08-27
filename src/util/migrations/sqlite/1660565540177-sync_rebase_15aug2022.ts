import { MigrationInterface, QueryRunner } from "typeorm";

export class syncRebase15aug20221660565540177 implements MigrationInterface {
	name = "syncRebase15aug20221660565540177";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            CREATE TABLE "plugin_config" ("key" varchar PRIMARY KEY NOT NULL, "value" text)
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            DROP TABLE "plugin_config"
        `);
	}
}
