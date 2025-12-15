import { MigrationInterface, QueryRunner } from "typeorm";

export class RoleColors1752321571508 implements MigrationInterface {
    name = 'RoleColors1752321571508'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" ADD "colors" text`);
		await queryRunner.query(`UPDATE "roles" SET "colors" = jsonb_build_object('primary_color', "color") WHERE "colors" IS NULL`);
		await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "colors" SET NOT NULL`);
	}

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "colors"`);
    }

}
