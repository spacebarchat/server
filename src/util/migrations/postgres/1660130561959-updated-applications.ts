import { MigrationInterface, QueryRunner } from "typeorm";

export class updatedApplications1660130561959 implements MigrationInterface {
	name = "updatedApplications1660130561959";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE "applications" DROP CONSTRAINT "FK_e5bf78cdbbe9ba91062d74c5aba"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP COLUMN "rpc_origins"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP COLUMN "primary_sku_id"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP COLUMN "slug"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP COLUMN "guild_id"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD "type" text
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD "hook" boolean NOT NULL
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD "redirect_uris" text
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD "rpc_application_state" integer
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD "store_application_state" integer
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD "verification_state" integer
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD "interactions_endpoint_url" character varying
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD "integration_public" boolean
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD "integration_require_code_grant" boolean
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD "discoverability_state" integer
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD "discovery_eligibility_flags" integer
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD "tags" text
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD "install_params" text
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD "bot_user_id" character varying
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD CONSTRAINT "UQ_2ce5a55796fe4c2f77ece57a647" UNIQUE ("bot_user_id")
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ALTER COLUMN "description" DROP NOT NULL
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP COLUMN "flags"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD "flags" integer NOT NULL
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD CONSTRAINT "FK_2ce5a55796fe4c2f77ece57a647" FOREIGN KEY ("bot_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE "applications" DROP CONSTRAINT "FK_2ce5a55796fe4c2f77ece57a647"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP COLUMN "flags"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD "flags" character varying NOT NULL
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ALTER COLUMN "description"
            SET NOT NULL
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP CONSTRAINT "UQ_2ce5a55796fe4c2f77ece57a647"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP COLUMN "bot_user_id"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP COLUMN "install_params"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP COLUMN "tags"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP COLUMN "discovery_eligibility_flags"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP COLUMN "discoverability_state"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP COLUMN "integration_require_code_grant"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP COLUMN "integration_public"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP COLUMN "interactions_endpoint_url"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP COLUMN "verification_state"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP COLUMN "store_application_state"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP COLUMN "rpc_application_state"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP COLUMN "redirect_uris"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP COLUMN "hook"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP COLUMN "type"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD "guild_id" character varying
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD "slug" character varying
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD "primary_sku_id" character varying
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD "rpc_origins" text
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD CONSTRAINT "FK_e5bf78cdbbe9ba91062d74c5aba" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
	}
}
