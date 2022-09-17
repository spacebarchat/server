import { MigrationInterface, QueryRunner } from "typeorm";

export class registrationTokens1663440587650 implements MigrationInterface {
    name = 'registrationTokens1663440587650'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "valid_registration_tokens" (
                "id" character varying NOT NULL,
                "token" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                CONSTRAINT "PK_aac42a46cd46369450217de1c8a" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "members"
            ALTER COLUMN "bio" DROP DEFAULT
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "members"
            ALTER COLUMN "bio"
            SET DEFAULT ''
        `);
        await queryRunner.query(`
            DROP TABLE "valid_registration_tokens"
        `);
    }

}
