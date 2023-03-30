/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class staging1672815835837 {
	name = "staging1672815835837";

	async up(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_76ba283779c8441fd5ff819c8cf"`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_settings" RENAME COLUMN "id" TO "index"`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_settings" RENAME CONSTRAINT "PK_00f004f5922a0744d174530d639" TO "PK_e81f8bb92802737337d35c00981"`,
		);
		await queryRunner.query(
			`CREATE TABLE "embed_cache" ("id" character varying NOT NULL, "url" character varying NOT NULL, "embed" text NOT NULL, CONSTRAINT "PK_0abb7581d4efc5a8b1361389c5e" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "security_settings" ("id" character varying NOT NULL, "guild_id" character varying, "channel_id" character varying, "encryption_permission_mask" integer NOT NULL, "allowed_algorithms" text NOT NULL, "current_algorithm" character varying NOT NULL, "used_since_message" character varying, CONSTRAINT "PK_4aec436cf81177ae97a1bcec3c7" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`ALTER TABLE "client_release" DROP COLUMN IF EXISTS "deb_url"`,
		);
		await queryRunner.query(
			`ALTER TABLE "client_release" DROP COLUMN IF EXISTS "osx_url"`,
		);
		await queryRunner.query(
			`ALTER TABLE "client_release" DROP COLUMN IF EXISTS "win_url"`,
		);
		await queryRunner.query(
			`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "REL_76ba283779c8441fd5ff819c8c"`,
		);
		await queryRunner.query(
			`ALTER TABLE "users" DROP COLUMN IF EXISTS "settingsId"`,
		);
		await queryRunner.query(
			`ALTER TABLE "client_release" ADD "platform" character varying NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "client_release" ADD "enabled" boolean NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "users" ADD "purchased_flags" integer NOT NULL DEFAULT 0`,
		);
		await queryRunner.query(
			`ALTER TABLE "users" ADD "premium_usage_flags" integer NOT NULl DEFAULT 0`,
		);
		await queryRunner.query(
			`ALTER TABLE "users" ADD "settingsIndex" integer`,
		);
		await queryRunner.query(
			`ALTER TABLE "users" ADD CONSTRAINT "UQ_0c14beb78d8c5ccba66072adbc7" UNIQUE ("settingsIndex")`,
		);
		await queryRunner.query(
			`ALTER TABLE "client_release" DROP COLUMN IF EXISTS "pub_date"`,
		);
		await queryRunner.query(
			`ALTER TABLE "client_release" ADD "pub_date" TIMESTAMP NOT NULL`,
		);
		await queryRunner.query(
			`UPDATE channels SET nsfw = false WHERE nsfw IS NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "channels" ALTER COLUMN "nsfw" SET NOT NULL`,
		);
		await queryRunner.query(
			`UPDATE channels SET flags = 0 WHERE flags IS NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "channels" ALTER COLUMN "flags" SET NOT NULL`,
		);
		await queryRunner.query(
			`UPDATE channels SET default_thread_rate_limit_per_user = 0 WHERE default_thread_rate_limit_per_user IS NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "channels" ALTER COLUMN "default_thread_rate_limit_per_user" SET NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_settings" DROP CONSTRAINT IF EXISTS "PK_e81f8bb92802737337d35c00981"`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_settings" DROP COLUMN IF EXISTS "index"`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_settings" ADD "index" SERIAL NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_settings" ADD CONSTRAINT "PK_e81f8bb92802737337d35c00981" PRIMARY KEY ("index")`,
		);
		await queryRunner.query(
			`ALTER TABLE "guilds" DROP COLUMN IF EXISTS "primary_category_id"`,
		);
		await queryRunner.query(
			`ALTER TABLE "guilds" ADD "primary_category_id" character varying`,
		);
		await queryRunner.query(
			`UPDATE guilds SET large = false WHERE large IS NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "guilds" ALTER COLUMN "large" SET NOT NULL`,
		);
		await queryRunner.query(
			`UPDATE guilds SET premium_tier = 0 WHERE premium_tier IS NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "guilds" ALTER COLUMN "premium_tier" SET NOT NULL`,
		);
		await queryRunner.query(
			`UPDATE guilds SET unavailable = false WHERE unavailable IS NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "guilds" ALTER COLUMN "unavailable" SET NOT NULL`,
		);
		await queryRunner.query(
			`UPDATE guilds SET widget_enabled = false WHERE widget_enabled IS NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "guilds" ALTER COLUMN "widget_enabled" SET NOT NULL`,
		);
		await queryRunner.query(
			`UPDATE guilds SET nsfw = false WHERE nsfw IS NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "guilds" ALTER COLUMN "nsfw" SET NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "members" DROP COLUMN IF EXISTS "premium_since"`,
		);
		await queryRunner.query(
			`ALTER TABLE "members" ADD "premium_since" bigint`,
		);
		await queryRunner.query(`ALTER TABLE members ADD theme_colors text`);
		await queryRunner.query(`ALTER TABLE members ADD pronouns varchar`);
		await queryRunner.query(`UPDATE users SET bio = '' WHERE bio IS NULL`);
		await queryRunner.query(
			`ALTER TABLE users ALTER COLUMN bio SET NOT NULL`,
		);
		await queryRunner.query(`ALTER TABLE users ADD theme_colors text`);
		await queryRunner.query(`ALTER TABLE users ADD pronouns varchar`);
		await queryRunner.query(
			`UPDATE users SET mfa_enabled = false WHERE mfa_enabled IS NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE users ALTER COLUMN mfa_enabled SET NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "users" ADD CONSTRAINT "FK_0c14beb78d8c5ccba66072adbc7" FOREIGN KEY ("settingsIndex") REFERENCES "user_settings"("index") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}

	async down(queryRunner) {}
};
