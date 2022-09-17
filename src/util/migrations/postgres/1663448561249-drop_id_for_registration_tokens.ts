import { MigrationInterface, QueryRunner } from "typeorm";

export class dropIdForRegistrationTokens1663448561249 implements MigrationInterface {
	name = "dropIdForRegistrationTokens1663448561249";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE "valid_registration_tokens" DROP CONSTRAINT "PK_aac42a46cd46369450217de1c8a"
        `);
		await queryRunner.query(`
            ALTER TABLE "valid_registration_tokens" DROP COLUMN "id"
        `);
		await queryRunner.query(`
            ALTER TABLE "valid_registration_tokens"
            ADD CONSTRAINT "PK_e0f5c8e3fcefe3134a092c50485" PRIMARY KEY ("token")
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE "valid_registration_tokens" DROP CONSTRAINT "PK_e0f5c8e3fcefe3134a092c50485"
        `);
		await queryRunner.query(`
            ALTER TABLE "valid_registration_tokens"
            ADD "id" character varying NOT NULL
        `);
		await queryRunner.query(`
            ALTER TABLE "valid_registration_tokens"
            ADD CONSTRAINT "PK_aac42a46cd46369450217de1c8a" PRIMARY KEY ("id")
        `);
	}
}
