import { MigrationInterface, QueryRunner } from "typeorm";

export class ReconcileMigrationAttempts1760622755598 implements MigrationInterface {
	name = "ReconcileMigrationAttempts1760622755598";

	public async up(queryRunner: QueryRunner): Promise<void> {
		// doesnt work because initial setup is syncDb()
		//await queryRunner.query(`ALTER TABLE "webhooks" DROP CONSTRAINT "fk_d64f38834fa676f6caa4786ddd6"`);
		await queryRunner.query(`ALTER TABLE "webhooks" ALTER COLUMN "source_channel_id" TYPE character varying`);
		await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "username" TYPE character varying`);
		await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "avatar" TYPE character varying`);
		await queryRunner.query(`ALTER TABLE "channels" ALTER COLUMN "default_thread_rate_limit_per_user" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "client_status" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "user_settings" ALTER COLUMN "friend_discovery_flags" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "user_settings" ALTER COLUMN "view_nsfw_guilds" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "flags" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "public_flags" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "purchased_flags" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "team_members" ALTER COLUMN "role" TYPE character varying`);
		await queryRunner.query(`ALTER TABLE "team_members" ALTER COLUMN "role" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "applications" ALTER COLUMN "guild_id" TYPE character varying`);
		await queryRunner.query(`ALTER TABLE "applications" ALTER COLUMN "custom_install_url" TYPE character varying`);
		await queryRunner.query(`ALTER TABLE "categories" ALTER COLUMN "icon" TYPE character varying`);
		await queryRunner.query(`ALTER TABLE "user_settings_protos" ALTER COLUMN "userSettings" TYPE character varying`);
		await queryRunner.query(`ALTER TABLE "user_settings_protos" ALTER COLUMN "frecencySettings" TYPE character varying`);
		await queryRunner.query(
			`ALTER TABLE "webhooks" ADD CONSTRAINT "FK_4495b7032a33c6b8b605d030398" FOREIGN KEY ("source_channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "applications" ADD CONSTRAINT "FK_e5bf78cdbbe9ba91062d74c5aba" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "applications" DROP CONSTRAINT "FK_e5bf78cdbbe9ba91062d74c5aba"`);
		await queryRunner.query(`ALTER TABLE "webhooks" DROP CONSTRAINT "FK_4495b7032a33c6b8b605d030398"`);
		await queryRunner.query(`ALTER TABLE "user_settings_protos" ALTER COLUMN "frecencySettings" TYPE text`);
		await queryRunner.query(`ALTER TABLE "user_settings_protos" ALTER COLUMN "userSettings" TYPE text`);
		await queryRunner.query(`ALTER TABLE "categories" ALTER COLUMN "icon" TYPE text`);
		await queryRunner.query(`ALTER TABLE "applications" ALTER COLUMN "custom_install_url" TYPE text`);
		await queryRunner.query(`ALTER TABLE "applications" ALTER COLUMN "guild_id" TYPE text`);
		await queryRunner.query(`ALTER TABLE "team_members" ALTER COLUMN "role" TYPE text`);
		await queryRunner.query(`ALTER TABLE "team_members" ALTER COLUMN "role" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "purchased_flags" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "public_flags" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "flags" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "user_settings" ALTER COLUMN "view_nsfw_guilds" SET DEFAULT true`);
		await queryRunner.query(`ALTER TABLE "user_settings" ALTER COLUMN "friend_discovery_flags" SET DEFAULT '0'`);
		await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "client_status" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "channels" ALTER COLUMN "default_thread_rate_limit_per_user" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "avatar" TYPE text`);
		await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "username" TYPE text`);
		await queryRunner.query(`ALTER TABLE "webhooks" ALTER COLUMN "source_channel_id" TYPE character varying(255)`);
		await queryRunner.query(`ALTER TABLE "webhooks" ALTER COLUMN "source_channel_id" SET DEFAULT NULL`);
		// await queryRunner.query(`ALTER TABLE "webhooks" ADD CONSTRAINT "fk_d64f38834fa676f6caa4786ddd6" FOREIGN KEY ("source_channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
	}
}
