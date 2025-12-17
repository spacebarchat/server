import { MigrationInterface, QueryRunner } from "typeorm";

export class ApplicationCommands1760622755598 implements MigrationInterface {
	name = "ApplicationCommands1760622755598";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "application_commands" ("id" character varying NOT NULL, "type" integer NOT NULL DEFAULT '1', "application_id" character varying NOT NULL, "guild_id" character varying, "name" character varying NOT NULL, "name_localizations" text, "description" character varying NOT NULL, "description_localizations" text, "options" text, "default_member_permissions" character varying, "dm_permission" boolean NOT NULL DEFAULT true, "permissions" text, "nsfw" boolean NOT NULL DEFAULT false, "integration_types" text, "global_popularity_rank" integer NOT NULL DEFAULT '0', "contexts" text, "version" character varying NOT NULL DEFAULT '0', "handler" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_0f73c2f025989c407947e1f75fe" PRIMARY KEY ("id"))`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "application_commands"`);
	}
}
