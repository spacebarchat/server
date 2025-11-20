import { MigrationInterface, QueryRunner } from "typeorm";

export class DefaultActivitiesToEmptyArray1763630755675 implements MigrationInterface {
	name = "DefaultActivitiesToEmptyArray1763630755675";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "activities" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "activities" SET DEFAULT '[]'`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "activities" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "activities" DROP NOT NULL`);
	}
}
