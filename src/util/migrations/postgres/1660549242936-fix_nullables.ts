import { MigrationInterface, QueryRunner } from "typeorm";

export class fixNullables1660549242936 implements MigrationInterface {
	name = "fixNullables1660549242936";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "bio" DROP NOT NULL
        `);
		await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "mfa_enabled" DROP NOT NULL
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "mfa_enabled"
            SET NOT NULL
        `);
		await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "bio"
            SET NOT NULL
        `);
	}
}
