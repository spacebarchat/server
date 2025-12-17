import { MigrationInterface, QueryRunner } from "typeorm";

export class Automod1753639700904 implements MigrationInterface {
	name = "Automod1753639700904";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "automod_rules" ("id" character varying NOT NULL, "enabled" boolean NOT NULL, "event_type" integer NOT NULL, "exempt_channels" text NOT NULL, "exempt_roles" text NOT NULL, "guild_id" character varying NOT NULL, "name" character varying NOT NULL, "position" integer NOT NULL, "trigger_type" integer NOT NULL, "trigger_metadata" text, "actions" text NOT NULL, "creator_id" character varying, CONSTRAINT "PK_99789ae863507f5aed9e58d7866" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`ALTER TABLE "automod_rules" ADD CONSTRAINT "FK_12d3d60b961393d310429c062b7" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "automod_rules" DROP CONSTRAINT "FK_12d3d60b961393d310429c062b7"`);
		await queryRunner.query(`DROP TABLE "automod_rules"`);
	}
}
