import { MigrationInterface, QueryRunner } from "typeorm";

export class dropIdForRegistrationTokens1663448560501 implements MigrationInterface {
    name = 'dropIdForRegistrationTokens1663448560501'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "temporary_valid_registration_tokens" (
                "token" varchar NOT NULL,
                "created_at" datetime NOT NULL,
                "expires_at" datetime NOT NULL
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_valid_registration_tokens"("token", "created_at", "expires_at")
            SELECT "token",
                "created_at",
                "expires_at"
            FROM "valid_registration_tokens"
        `);
        await queryRunner.query(`
            DROP TABLE "valid_registration_tokens"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_valid_registration_tokens"
                RENAME TO "valid_registration_tokens"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_valid_registration_tokens" (
                "token" varchar PRIMARY KEY NOT NULL,
                "created_at" datetime NOT NULL,
                "expires_at" datetime NOT NULL
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_valid_registration_tokens"("token", "created_at", "expires_at")
            SELECT "token",
                "created_at",
                "expires_at"
            FROM "valid_registration_tokens"
        `);
        await queryRunner.query(`
            DROP TABLE "valid_registration_tokens"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_valid_registration_tokens"
                RENAME TO "valid_registration_tokens"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "valid_registration_tokens"
                RENAME TO "temporary_valid_registration_tokens"
        `);
        await queryRunner.query(`
            CREATE TABLE "valid_registration_tokens" (
                "token" varchar NOT NULL,
                "created_at" datetime NOT NULL,
                "expires_at" datetime NOT NULL
            )
        `);
        await queryRunner.query(`
            INSERT INTO "valid_registration_tokens"("token", "created_at", "expires_at")
            SELECT "token",
                "created_at",
                "expires_at"
            FROM "temporary_valid_registration_tokens"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_valid_registration_tokens"
        `);
        await queryRunner.query(`
            ALTER TABLE "valid_registration_tokens"
                RENAME TO "temporary_valid_registration_tokens"
        `);
        await queryRunner.query(`
            CREATE TABLE "valid_registration_tokens" (
                "id" varchar PRIMARY KEY NOT NULL,
                "token" varchar NOT NULL,
                "created_at" datetime NOT NULL,
                "expires_at" datetime NOT NULL
            )
        `);
        await queryRunner.query(`
            INSERT INTO "valid_registration_tokens"("token", "created_at", "expires_at")
            SELECT "token",
                "created_at",
                "expires_at"
            FROM "temporary_valid_registration_tokens"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_valid_registration_tokens"
        `);
    }

}
