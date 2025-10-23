import { MigrationInterface, QueryRunner } from "typeorm";

export class ApplicationCommandsOptionsDefault1761209437070 implements MigrationInterface {
	name = "ApplicationCommandsOptionsDefault1761209437070";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`UPDATE "application_commands" SET "options" = '[]' WHERE "options" IS NULL`);
		await queryRunner.query(`ALTER TABLE "application_commands" ALTER COLUMN "options" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "application_commands" ALTER COLUMN "options" SET DEFAULT '[]'`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "application_commands" ALTER COLUMN "options" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "application_commands" ALTER COLUMN "options" DROP NOT NULL`);
	}
}
