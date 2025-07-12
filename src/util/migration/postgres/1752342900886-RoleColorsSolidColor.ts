import { MigrationInterface, QueryRunner } from "typeorm";

export class RoleColorsSolidColor1752342900886 implements MigrationInterface {
    name = 'RoleColorsSolidColor1752342900886'

    public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`UPDATE "roles" SET "colors" = jsonb_build_object('primary_color', "color") WHERE "colors" IS NULL`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "colors" SET NOT NULL`);
	}

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "colors" DROP NOT NULL`);
    }

}
