import { MigrationInterface, QueryRunner } from "typeorm";

export class RoleColors1752321571508 implements MigrationInterface {
    name = 'RoleColors1752321571508'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" ADD "colors" text`);
	}

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "colors"`);
    }

}
