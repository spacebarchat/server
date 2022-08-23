import { MigrationInterface, QueryRunner } from "typeorm";

export class CodeCleanup31660258351379 implements MigrationInterface {
	name = "CodeCleanup31660258351379";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            CREATE TABLE "temporary_users" (
                "id" varchar PRIMARY KEY NOT NULL,
                "username" varchar NOT NULL,
                "discriminator" varchar NOT NULL,
                "avatar" varchar,
                "accent_color" integer,
                "banner" varchar,
                "phone" varchar,
                "desktop" boolean NOT NULL,
                "mobile" boolean NOT NULL,
                "premium" boolean NOT NULL,
                "premium_type" integer NOT NULL,
                "bot" boolean NOT NULL,
                "bio" varchar NOT NULL,
                "system" boolean NOT NULL,
                "nsfw_allowed" boolean NOT NULL,
                "mfa_enabled" boolean NOT NULL,
                "totp_secret" varchar,
                "totp_last_ticket" varchar,
                "created_at" datetime NOT NULL,
                "premium_since" datetime,
                "verified" boolean NOT NULL,
                "disabled" boolean NOT NULL,
                "deleted" boolean NOT NULL,
                "email" varchar,
                "flags" varchar NOT NULL,
                "public_flags" integer NOT NULL,
                "rights" bigint NOT NULL,
                "data" text NOT NULL,
                "fingerprints" text NOT NULL,
                "extended_settings" text NOT NULL,
                "notes" text NOT NULL
            )
        `);
		await queryRunner.query(`
            INSERT INTO "temporary_users"(
                    "id",
                    "username",
                    "discriminator",
                    "avatar",
                    "accent_color",
                    "banner",
                    "phone",
                    "desktop",
                    "mobile",
                    "premium",
                    "premium_type",
                    "bot",
                    "bio",
                    "system",
                    "nsfw_allowed",
                    "mfa_enabled",
                    "totp_secret",
                    "totp_last_ticket",
                    "created_at",
                    "premium_since",
                    "verified",
                    "disabled",
                    "deleted",
                    "email",
                    "flags",
                    "public_flags",
                    "rights",
                    "data",
                    "fingerprints",
                    "extended_settings",
                    "notes"
                )
            SELECT "id",
                "username",
                "discriminator",
                "avatar",
                "accent_color",
                "banner",
                "phone",
                "desktop",
                "mobile",
                "premium",
                "premium_type",
                "bot",
                "bio",
                "system",
                "nsfw_allowed",
                "mfa_enabled",
                "totp_secret",
                "totp_last_ticket",
                "created_at",
                "premium_since",
                "verified",
                "disabled",
                "deleted",
                "email",
                "flags",
                "public_flags",
                "rights",
                "data",
                "fingerprints",
                "extended_settings",
                "notes"
            FROM "users"
        `);
		await queryRunner.query(`
            DROP TABLE "users"
        `);
		await queryRunner.query(`
            ALTER TABLE "temporary_users"
                RENAME TO "users"
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE "users"
                RENAME TO "temporary_users"
        `);
		await queryRunner.query(`
            CREATE TABLE "users" (
                "id" varchar PRIMARY KEY NOT NULL,
                "username" varchar NOT NULL,
                "discriminator" varchar NOT NULL,
                "avatar" varchar,
                "accent_color" integer,
                "banner" varchar,
                "phone" varchar,
                "desktop" boolean NOT NULL,
                "mobile" boolean NOT NULL,
                "premium" boolean NOT NULL,
                "premium_type" integer NOT NULL,
                "bot" boolean NOT NULL,
                "bio" varchar NOT NULL,
                "system" boolean NOT NULL,
                "nsfw_allowed" boolean NOT NULL,
                "mfa_enabled" boolean NOT NULL,
                "totp_secret" varchar,
                "totp_last_ticket" varchar,
                "created_at" datetime NOT NULL,
                "premium_since" datetime,
                "verified" boolean NOT NULL,
                "disabled" boolean NOT NULL,
                "deleted" boolean NOT NULL,
                "email" varchar,
                "flags" varchar NOT NULL,
                "public_flags" integer NOT NULL,
                "rights" bigint NOT NULL,
                "data" text NOT NULL,
                "fingerprints" text NOT NULL,
                "settings" text NOT NULL,
                "extended_settings" text NOT NULL,
                "notes" text NOT NULL
            )
        `);
		await queryRunner.query(`
            INSERT INTO "users"(
                    "id",
                    "username",
                    "discriminator",
                    "avatar",
                    "accent_color",
                    "banner",
                    "phone",
                    "desktop",
                    "mobile",
                    "premium",
                    "premium_type",
                    "bot",
                    "bio",
                    "system",
                    "nsfw_allowed",
                    "mfa_enabled",
                    "totp_secret",
                    "totp_last_ticket",
                    "created_at",
                    "premium_since",
                    "verified",
                    "disabled",
                    "deleted",
                    "email",
                    "flags",
                    "public_flags",
                    "rights",
                    "data",
                    "fingerprints",
                    "extended_settings",
                    "notes"
                )
            SELECT "id",
                "username",
                "discriminator",
                "avatar",
                "accent_color",
                "banner",
                "phone",
                "desktop",
                "mobile",
                "premium",
                "premium_type",
                "bot",
                "bio",
                "system",
                "nsfw_allowed",
                "mfa_enabled",
                "totp_secret",
                "totp_last_ticket",
                "created_at",
                "premium_since",
                "verified",
                "disabled",
                "deleted",
                "email",
                "flags",
                "public_flags",
                "rights",
                "data",
                "fingerprints",
                "extended_settings",
                "notes"
            FROM "temporary_users"
        `);
		await queryRunner.query(`
            DROP TABLE "temporary_users"
        `);
	}
}
