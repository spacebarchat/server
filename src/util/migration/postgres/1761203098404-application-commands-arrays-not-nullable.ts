import { MigrationInterface, QueryRunner } from "typeorm";

export class ApplicationCommandsArraysNotNullable1761203098404 implements MigrationInterface {
	name = "ApplicationCommandsArraysNotNullable1761203098404";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`UPDATE "application_commands" SET options = '[]' WHERE options IS NULL`);
		await queryRunner.query(`UPDATE "application_commands" SET integration_types = '[]' WHERE integration_types IS NULL`);
		await queryRunner.query(`UPDATE "application_commands" SET contexts = '[]' WHERE contexts IS NULL`);
		await queryRunner.query(`ALTER TABLE "application_commands" ALTER COLUMN "options" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "application_commands" ALTER COLUMN "options" SET DEFAULT '[]'`);
		await queryRunner.query(`ALTER TABLE "application_commands" ALTER COLUMN "integration_types" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "application_commands" ALTER COLUMN "integration_types" SET DEFAULT '[]'`);
		await queryRunner.query(`ALTER TABLE "application_commands" ALTER COLUMN "contexts" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "application_commands" ALTER COLUMN "contexts" SET DEFAULT '[]'`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "application_commands" ALTER COLUMN "contexts" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "application_commands" ALTER COLUMN "contexts" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "application_commands" ALTER COLUMN "integration_types" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "application_commands" ALTER COLUMN "integration_types" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "application_commands" ALTER COLUMN "options" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "application_commands" ALTER COLUMN "options" DROP NOT NULL`);
	}
}
