import { MigrationInterface, QueryRunner } from "typeorm";

export class CodeCleanup51660265907544 implements MigrationInterface {
	name = "CodeCleanup51660265907544";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE "channels"
            ADD "flags" integer
        `);
		await queryRunner.query(`
            ALTER TABLE "channels"
            ADD "default_thread_rate_limit_per_user" integer
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE "channels" DROP COLUMN "default_thread_rate_limit_per_user"
        `);
		await queryRunner.query(`
            ALTER TABLE "channels" DROP COLUMN "flags"
        `);
	}
}
