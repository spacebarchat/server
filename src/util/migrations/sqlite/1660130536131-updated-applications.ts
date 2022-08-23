import { MigrationInterface, QueryRunner } from "typeorm";

export class updatedApplications1660130536131 implements MigrationInterface {
	name = "updatedApplications1660130536131";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            CREATE TABLE "temporary_applications" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "icon" varchar,
                "description" varchar NOT NULL,
                "rpc_origins" text,
                "bot_public" boolean NOT NULL,
                "bot_require_code_grant" boolean NOT NULL,
                "terms_of_service_url" varchar,
                "privacy_policy_url" varchar,
                "summary" varchar,
                "verify_key" varchar NOT NULL,
                "primary_sku_id" varchar,
                "slug" varchar,
                "cover_image" varchar,
                "flags" varchar NOT NULL,
                "owner_id" varchar,
                "team_id" varchar,
                "guild_id" varchar,
                CONSTRAINT "FK_a36ed02953077f408d0f3ebc424" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_e57508958bf92b9d9d25231b5e8" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
		await queryRunner.query(`
            INSERT INTO "temporary_applications"(
                    "id",
                    "name",
                    "icon",
                    "description",
                    "rpc_origins",
                    "bot_public",
                    "bot_require_code_grant",
                    "terms_of_service_url",
                    "privacy_policy_url",
                    "summary",
                    "verify_key",
                    "primary_sku_id",
                    "slug",
                    "cover_image",
                    "flags",
                    "owner_id",
                    "team_id",
                    "guild_id"
                )
            SELECT "id",
                "name",
                "icon",
                "description",
                "rpc_origins",
                "bot_public",
                "bot_require_code_grant",
                "terms_of_service_url",
                "privacy_policy_url",
                "summary",
                "verify_key",
                "primary_sku_id",
                "slug",
                "cover_image",
                "flags",
                "owner_id",
                "team_id",
                "guild_id"
            FROM "applications"
        `);
		await queryRunner.query(`
            DROP TABLE "applications"
        `);
		await queryRunner.query(`
            ALTER TABLE "temporary_applications"
                RENAME TO "applications"
        `);
		await queryRunner.query(`
            CREATE TABLE "temporary_applications" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "icon" varchar,
                "description" varchar NOT NULL,
                "bot_public" boolean NOT NULL,
                "bot_require_code_grant" boolean NOT NULL,
                "terms_of_service_url" varchar,
                "privacy_policy_url" varchar,
                "summary" varchar,
                "verify_key" varchar NOT NULL,
                "cover_image" varchar,
                "flags" varchar NOT NULL,
                "owner_id" varchar,
                "team_id" varchar,
                CONSTRAINT "FK_a36ed02953077f408d0f3ebc424" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_e57508958bf92b9d9d25231b5e8" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
		await queryRunner.query(`
            INSERT INTO "temporary_applications"(
                    "id",
                    "name",
                    "icon",
                    "description",
                    "bot_public",
                    "bot_require_code_grant",
                    "terms_of_service_url",
                    "privacy_policy_url",
                    "summary",
                    "verify_key",
                    "cover_image",
                    "flags",
                    "owner_id",
                    "team_id"
                )
            SELECT "id",
                "name",
                "icon",
                "description",
                "bot_public",
                "bot_require_code_grant",
                "terms_of_service_url",
                "privacy_policy_url",
                "summary",
                "verify_key",
                "cover_image",
                "flags",
                "owner_id",
                "team_id"
            FROM "applications"
        `);
		await queryRunner.query(`
            DROP TABLE "applications"
        `);
		await queryRunner.query(`
            ALTER TABLE "temporary_applications"
                RENAME TO "applications"
        `);
		await queryRunner.query(`
            CREATE TABLE "temporary_applications" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "icon" varchar,
                "description" varchar NOT NULL,
                "bot_public" boolean NOT NULL,
                "bot_require_code_grant" boolean NOT NULL,
                "terms_of_service_url" varchar,
                "privacy_policy_url" varchar,
                "summary" varchar,
                "verify_key" varchar NOT NULL,
                "cover_image" varchar,
                "flags" varchar NOT NULL,
                "owner_id" varchar,
                "team_id" varchar,
                "type" text,
                "hook" boolean NOT NULL,
                "redirect_uris" text,
                "rpc_application_state" integer,
                "store_application_state" integer,
                "verification_state" integer,
                "interactions_endpoint_url" varchar,
                "integration_public" boolean,
                "integration_require_code_grant" boolean,
                "discoverability_state" integer,
                "discovery_eligibility_flags" integer,
                "tags" text,
                "install_params" text,
                "bot_user_id" varchar,
                CONSTRAINT "UQ_b7f6e13565e920916d902e1f431" UNIQUE ("bot_user_id"),
                CONSTRAINT "FK_a36ed02953077f408d0f3ebc424" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_e57508958bf92b9d9d25231b5e8" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
		await queryRunner.query(`
            INSERT INTO "temporary_applications"(
                    "id",
                    "name",
                    "icon",
                    "description",
                    "bot_public",
                    "bot_require_code_grant",
                    "terms_of_service_url",
                    "privacy_policy_url",
                    "summary",
                    "verify_key",
                    "cover_image",
                    "flags",
                    "owner_id",
                    "team_id"
                )
            SELECT "id",
                "name",
                "icon",
                "description",
                "bot_public",
                "bot_require_code_grant",
                "terms_of_service_url",
                "privacy_policy_url",
                "summary",
                "verify_key",
                "cover_image",
                "flags",
                "owner_id",
                "team_id"
            FROM "applications"
        `);
		await queryRunner.query(`
            DROP TABLE "applications"
        `);
		await queryRunner.query(`
            ALTER TABLE "temporary_applications"
                RENAME TO "applications"
        `);
		await queryRunner.query(`
            CREATE TABLE "temporary_applications" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "icon" varchar,
                "description" varchar,
                "bot_public" boolean NOT NULL,
                "bot_require_code_grant" boolean NOT NULL,
                "terms_of_service_url" varchar,
                "privacy_policy_url" varchar,
                "summary" varchar,
                "verify_key" varchar NOT NULL,
                "cover_image" varchar,
                "flags" integer NOT NULL,
                "owner_id" varchar,
                "team_id" varchar,
                "type" text,
                "hook" boolean NOT NULL,
                "redirect_uris" text,
                "rpc_application_state" integer,
                "store_application_state" integer,
                "verification_state" integer,
                "interactions_endpoint_url" varchar,
                "integration_public" boolean,
                "integration_require_code_grant" boolean,
                "discoverability_state" integer,
                "discovery_eligibility_flags" integer,
                "tags" text,
                "install_params" text,
                "bot_user_id" varchar,
                CONSTRAINT "UQ_b7f6e13565e920916d902e1f431" UNIQUE ("bot_user_id"),
                CONSTRAINT "FK_a36ed02953077f408d0f3ebc424" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_e57508958bf92b9d9d25231b5e8" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
		await queryRunner.query(`
            INSERT INTO "temporary_applications"(
                    "id",
                    "name",
                    "icon",
                    "description",
                    "bot_public",
                    "bot_require_code_grant",
                    "terms_of_service_url",
                    "privacy_policy_url",
                    "summary",
                    "verify_key",
                    "cover_image",
                    "flags",
                    "owner_id",
                    "team_id",
                    "type",
                    "hook",
                    "redirect_uris",
                    "rpc_application_state",
                    "store_application_state",
                    "verification_state",
                    "interactions_endpoint_url",
                    "integration_public",
                    "integration_require_code_grant",
                    "discoverability_state",
                    "discovery_eligibility_flags",
                    "tags",
                    "install_params",
                    "bot_user_id"
                )
            SELECT "id",
                "name",
                "icon",
                "description",
                "bot_public",
                "bot_require_code_grant",
                "terms_of_service_url",
                "privacy_policy_url",
                "summary",
                "verify_key",
                "cover_image",
                "flags",
                "owner_id",
                "team_id",
                "type",
                "hook",
                "redirect_uris",
                "rpc_application_state",
                "store_application_state",
                "verification_state",
                "interactions_endpoint_url",
                "integration_public",
                "integration_require_code_grant",
                "discoverability_state",
                "discovery_eligibility_flags",
                "tags",
                "install_params",
                "bot_user_id"
            FROM "applications"
        `);
		await queryRunner.query(`
            DROP TABLE "applications"
        `);
		await queryRunner.query(`
            ALTER TABLE "temporary_applications"
                RENAME TO "applications"
        `);
		await queryRunner.query(`
            CREATE TABLE "temporary_applications" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "icon" varchar,
                "description" varchar,
                "bot_public" boolean NOT NULL,
                "bot_require_code_grant" boolean NOT NULL,
                "terms_of_service_url" varchar,
                "privacy_policy_url" varchar,
                "summary" varchar,
                "verify_key" varchar NOT NULL,
                "cover_image" varchar,
                "flags" integer NOT NULL,
                "owner_id" varchar,
                "team_id" varchar,
                "type" text,
                "hook" boolean NOT NULL,
                "redirect_uris" text,
                "rpc_application_state" integer,
                "store_application_state" integer,
                "verification_state" integer,
                "interactions_endpoint_url" varchar,
                "integration_public" boolean,
                "integration_require_code_grant" boolean,
                "discoverability_state" integer,
                "discovery_eligibility_flags" integer,
                "tags" text,
                "install_params" text,
                "bot_user_id" varchar,
                CONSTRAINT "UQ_b7f6e13565e920916d902e1f431" UNIQUE ("bot_user_id"),
                CONSTRAINT "FK_a36ed02953077f408d0f3ebc424" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_e57508958bf92b9d9d25231b5e8" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_2ce5a55796fe4c2f77ece57a647" FOREIGN KEY ("bot_user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
		await queryRunner.query(`
            INSERT INTO "temporary_applications"(
                    "id",
                    "name",
                    "icon",
                    "description",
                    "bot_public",
                    "bot_require_code_grant",
                    "terms_of_service_url",
                    "privacy_policy_url",
                    "summary",
                    "verify_key",
                    "cover_image",
                    "flags",
                    "owner_id",
                    "team_id",
                    "type",
                    "hook",
                    "redirect_uris",
                    "rpc_application_state",
                    "store_application_state",
                    "verification_state",
                    "interactions_endpoint_url",
                    "integration_public",
                    "integration_require_code_grant",
                    "discoverability_state",
                    "discovery_eligibility_flags",
                    "tags",
                    "install_params",
                    "bot_user_id"
                )
            SELECT "id",
                "name",
                "icon",
                "description",
                "bot_public",
                "bot_require_code_grant",
                "terms_of_service_url",
                "privacy_policy_url",
                "summary",
                "verify_key",
                "cover_image",
                "flags",
                "owner_id",
                "team_id",
                "type",
                "hook",
                "redirect_uris",
                "rpc_application_state",
                "store_application_state",
                "verification_state",
                "interactions_endpoint_url",
                "integration_public",
                "integration_require_code_grant",
                "discoverability_state",
                "discovery_eligibility_flags",
                "tags",
                "install_params",
                "bot_user_id"
            FROM "applications"
        `);
		await queryRunner.query(`
            DROP TABLE "applications"
        `);
		await queryRunner.query(`
            ALTER TABLE "temporary_applications"
                RENAME TO "applications"
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE "applications"
                RENAME TO "temporary_applications"
        `);
		await queryRunner.query(`
            CREATE TABLE "applications" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "icon" varchar,
                "description" varchar,
                "bot_public" boolean NOT NULL,
                "bot_require_code_grant" boolean NOT NULL,
                "terms_of_service_url" varchar,
                "privacy_policy_url" varchar,
                "summary" varchar,
                "verify_key" varchar NOT NULL,
                "cover_image" varchar,
                "flags" integer NOT NULL,
                "owner_id" varchar,
                "team_id" varchar,
                "type" text,
                "hook" boolean NOT NULL,
                "redirect_uris" text,
                "rpc_application_state" integer,
                "store_application_state" integer,
                "verification_state" integer,
                "interactions_endpoint_url" varchar,
                "integration_public" boolean,
                "integration_require_code_grant" boolean,
                "discoverability_state" integer,
                "discovery_eligibility_flags" integer,
                "tags" text,
                "install_params" text,
                "bot_user_id" varchar,
                CONSTRAINT "UQ_b7f6e13565e920916d902e1f431" UNIQUE ("bot_user_id"),
                CONSTRAINT "FK_a36ed02953077f408d0f3ebc424" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_e57508958bf92b9d9d25231b5e8" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
		await queryRunner.query(`
            INSERT INTO "applications"(
                    "id",
                    "name",
                    "icon",
                    "description",
                    "bot_public",
                    "bot_require_code_grant",
                    "terms_of_service_url",
                    "privacy_policy_url",
                    "summary",
                    "verify_key",
                    "cover_image",
                    "flags",
                    "owner_id",
                    "team_id",
                    "type",
                    "hook",
                    "redirect_uris",
                    "rpc_application_state",
                    "store_application_state",
                    "verification_state",
                    "interactions_endpoint_url",
                    "integration_public",
                    "integration_require_code_grant",
                    "discoverability_state",
                    "discovery_eligibility_flags",
                    "tags",
                    "install_params",
                    "bot_user_id"
                )
            SELECT "id",
                "name",
                "icon",
                "description",
                "bot_public",
                "bot_require_code_grant",
                "terms_of_service_url",
                "privacy_policy_url",
                "summary",
                "verify_key",
                "cover_image",
                "flags",
                "owner_id",
                "team_id",
                "type",
                "hook",
                "redirect_uris",
                "rpc_application_state",
                "store_application_state",
                "verification_state",
                "interactions_endpoint_url",
                "integration_public",
                "integration_require_code_grant",
                "discoverability_state",
                "discovery_eligibility_flags",
                "tags",
                "install_params",
                "bot_user_id"
            FROM "temporary_applications"
        `);
		await queryRunner.query(`
            DROP TABLE "temporary_applications"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
                RENAME TO "temporary_applications"
        `);
		await queryRunner.query(`
            CREATE TABLE "applications" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "icon" varchar,
                "description" varchar NOT NULL,
                "bot_public" boolean NOT NULL,
                "bot_require_code_grant" boolean NOT NULL,
                "terms_of_service_url" varchar,
                "privacy_policy_url" varchar,
                "summary" varchar,
                "verify_key" varchar NOT NULL,
                "cover_image" varchar,
                "flags" varchar NOT NULL,
                "owner_id" varchar,
                "team_id" varchar,
                "type" text,
                "hook" boolean NOT NULL,
                "redirect_uris" text,
                "rpc_application_state" integer,
                "store_application_state" integer,
                "verification_state" integer,
                "interactions_endpoint_url" varchar,
                "integration_public" boolean,
                "integration_require_code_grant" boolean,
                "discoverability_state" integer,
                "discovery_eligibility_flags" integer,
                "tags" text,
                "install_params" text,
                "bot_user_id" varchar,
                CONSTRAINT "UQ_b7f6e13565e920916d902e1f431" UNIQUE ("bot_user_id"),
                CONSTRAINT "FK_a36ed02953077f408d0f3ebc424" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_e57508958bf92b9d9d25231b5e8" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
		await queryRunner.query(`
            INSERT INTO "applications"(
                    "id",
                    "name",
                    "icon",
                    "description",
                    "bot_public",
                    "bot_require_code_grant",
                    "terms_of_service_url",
                    "privacy_policy_url",
                    "summary",
                    "verify_key",
                    "cover_image",
                    "flags",
                    "owner_id",
                    "team_id",
                    "type",
                    "hook",
                    "redirect_uris",
                    "rpc_application_state",
                    "store_application_state",
                    "verification_state",
                    "interactions_endpoint_url",
                    "integration_public",
                    "integration_require_code_grant",
                    "discoverability_state",
                    "discovery_eligibility_flags",
                    "tags",
                    "install_params",
                    "bot_user_id"
                )
            SELECT "id",
                "name",
                "icon",
                "description",
                "bot_public",
                "bot_require_code_grant",
                "terms_of_service_url",
                "privacy_policy_url",
                "summary",
                "verify_key",
                "cover_image",
                "flags",
                "owner_id",
                "team_id",
                "type",
                "hook",
                "redirect_uris",
                "rpc_application_state",
                "store_application_state",
                "verification_state",
                "interactions_endpoint_url",
                "integration_public",
                "integration_require_code_grant",
                "discoverability_state",
                "discovery_eligibility_flags",
                "tags",
                "install_params",
                "bot_user_id"
            FROM "temporary_applications"
        `);
		await queryRunner.query(`
            DROP TABLE "temporary_applications"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
                RENAME TO "temporary_applications"
        `);
		await queryRunner.query(`
            CREATE TABLE "applications" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "icon" varchar,
                "description" varchar NOT NULL,
                "bot_public" boolean NOT NULL,
                "bot_require_code_grant" boolean NOT NULL,
                "terms_of_service_url" varchar,
                "privacy_policy_url" varchar,
                "summary" varchar,
                "verify_key" varchar NOT NULL,
                "cover_image" varchar,
                "flags" varchar NOT NULL,
                "owner_id" varchar,
                "team_id" varchar,
                CONSTRAINT "FK_a36ed02953077f408d0f3ebc424" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_e57508958bf92b9d9d25231b5e8" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
		await queryRunner.query(`
            INSERT INTO "applications"(
                    "id",
                    "name",
                    "icon",
                    "description",
                    "bot_public",
                    "bot_require_code_grant",
                    "terms_of_service_url",
                    "privacy_policy_url",
                    "summary",
                    "verify_key",
                    "cover_image",
                    "flags",
                    "owner_id",
                    "team_id"
                )
            SELECT "id",
                "name",
                "icon",
                "description",
                "bot_public",
                "bot_require_code_grant",
                "terms_of_service_url",
                "privacy_policy_url",
                "summary",
                "verify_key",
                "cover_image",
                "flags",
                "owner_id",
                "team_id"
            FROM "temporary_applications"
        `);
		await queryRunner.query(`
            DROP TABLE "temporary_applications"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
                RENAME TO "temporary_applications"
        `);
		await queryRunner.query(`
            CREATE TABLE "applications" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "icon" varchar,
                "description" varchar NOT NULL,
                "rpc_origins" text,
                "bot_public" boolean NOT NULL,
                "bot_require_code_grant" boolean NOT NULL,
                "terms_of_service_url" varchar,
                "privacy_policy_url" varchar,
                "summary" varchar,
                "verify_key" varchar NOT NULL,
                "primary_sku_id" varchar,
                "slug" varchar,
                "cover_image" varchar,
                "flags" varchar NOT NULL,
                "owner_id" varchar,
                "team_id" varchar,
                "guild_id" varchar,
                CONSTRAINT "FK_a36ed02953077f408d0f3ebc424" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_e57508958bf92b9d9d25231b5e8" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
		await queryRunner.query(`
            INSERT INTO "applications"(
                    "id",
                    "name",
                    "icon",
                    "description",
                    "bot_public",
                    "bot_require_code_grant",
                    "terms_of_service_url",
                    "privacy_policy_url",
                    "summary",
                    "verify_key",
                    "cover_image",
                    "flags",
                    "owner_id",
                    "team_id"
                )
            SELECT "id",
                "name",
                "icon",
                "description",
                "bot_public",
                "bot_require_code_grant",
                "terms_of_service_url",
                "privacy_policy_url",
                "summary",
                "verify_key",
                "cover_image",
                "flags",
                "owner_id",
                "team_id"
            FROM "temporary_applications"
        `);
		await queryRunner.query(`
            DROP TABLE "temporary_applications"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
                RENAME TO "temporary_applications"
        `);
		await queryRunner.query(`
            CREATE TABLE "applications" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "icon" varchar,
                "description" varchar NOT NULL,
                "rpc_origins" text,
                "bot_public" boolean NOT NULL,
                "bot_require_code_grant" boolean NOT NULL,
                "terms_of_service_url" varchar,
                "privacy_policy_url" varchar,
                "summary" varchar,
                "verify_key" varchar NOT NULL,
                "primary_sku_id" varchar,
                "slug" varchar,
                "cover_image" varchar,
                "flags" varchar NOT NULL,
                "owner_id" varchar,
                "team_id" varchar,
                "guild_id" varchar,
                CONSTRAINT "FK_e5bf78cdbbe9ba91062d74c5aba" FOREIGN KEY ("guild_id") REFERENCES "guilds" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_a36ed02953077f408d0f3ebc424" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_e57508958bf92b9d9d25231b5e8" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
		await queryRunner.query(`
            INSERT INTO "applications"(
                    "id",
                    "name",
                    "icon",
                    "description",
                    "rpc_origins",
                    "bot_public",
                    "bot_require_code_grant",
                    "terms_of_service_url",
                    "privacy_policy_url",
                    "summary",
                    "verify_key",
                    "primary_sku_id",
                    "slug",
                    "cover_image",
                    "flags",
                    "owner_id",
                    "team_id",
                    "guild_id"
                )
            SELECT "id",
                "name",
                "icon",
                "description",
                "rpc_origins",
                "bot_public",
                "bot_require_code_grant",
                "terms_of_service_url",
                "privacy_policy_url",
                "summary",
                "verify_key",
                "primary_sku_id",
                "slug",
                "cover_image",
                "flags",
                "owner_id",
                "team_id",
                "guild_id"
            FROM "temporary_applications"
        `);
		await queryRunner.query(`
            DROP TABLE "temporary_applications"
        `);
	}
}
