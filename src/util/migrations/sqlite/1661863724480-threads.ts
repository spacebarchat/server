import { MigrationInterface, QueryRunner } from "typeorm";

export class threads1661863724480 implements MigrationInterface {
	name = "threads1661863724480";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            CREATE TABLE "temporary_channels" (
                "id" varchar PRIMARY KEY NOT NULL,
                "created_at" datetime NOT NULL,
                "name" varchar,
                "icon" text,
                "type" integer NOT NULL,
                "last_message_id" varchar,
                "guild_id" varchar,
                "parent_id" varchar,
                "owner_id" varchar,
                "last_pin_timestamp" integer,
                "default_auto_archive_duration" integer,
                "position" integer,
                "permission_overwrites" text,
                "video_quality_mode" integer,
                "bitrate" integer,
                "user_limit" integer,
                "nsfw" boolean,
                "rate_limit_per_user" integer,
                "topic" varchar,
                "retention_policy_id" varchar,
                "flags" integer,
                "default_thread_rate_limit_per_user" integer,
                "member_count" integer,
                "message_count" integer,
                "total_message_sent" integer,
                "thread_metadata" text,
                CONSTRAINT "FK_c253dafe5f3a03ec00cd8fb4581" FOREIGN KEY ("guild_id") REFERENCES "guilds" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_3274522d14af40540b1a883fc80" FOREIGN KEY ("parent_id") REFERENCES "channels" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_3873ed438575cce703ecff4fc7b" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
		await queryRunner.query(`
            INSERT INTO "temporary_channels"(
                    "id",
                    "created_at",
                    "name",
                    "icon",
                    "type",
                    "last_message_id",
                    "guild_id",
                    "parent_id",
                    "owner_id",
                    "last_pin_timestamp",
                    "default_auto_archive_duration",
                    "position",
                    "permission_overwrites",
                    "video_quality_mode",
                    "bitrate",
                    "user_limit",
                    "nsfw",
                    "rate_limit_per_user",
                    "topic",
                    "retention_policy_id",
                    "flags",
                    "default_thread_rate_limit_per_user"
                )
            SELECT "id",
                "created_at",
                "name",
                "icon",
                "type",
                "last_message_id",
                "guild_id",
                "parent_id",
                "owner_id",
                "last_pin_timestamp",
                "default_auto_archive_duration",
                "position",
                "permission_overwrites",
                "video_quality_mode",
                "bitrate",
                "user_limit",
                "nsfw",
                "rate_limit_per_user",
                "topic",
                "retention_policy_id",
                "flags",
                "default_thread_rate_limit_per_user"
            FROM "channels"
        `);
		await queryRunner.query(`
            DROP TABLE "channels"
        `);
		await queryRunner.query(`
            ALTER TABLE "temporary_channels"
                RENAME TO "channels"
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE "channels"
                RENAME TO "temporary_channels"
        `);
		await queryRunner.query(`
            CREATE TABLE "channels" (
                "id" varchar PRIMARY KEY NOT NULL,
                "created_at" datetime NOT NULL,
                "name" varchar,
                "icon" text,
                "type" integer NOT NULL,
                "last_message_id" varchar,
                "guild_id" varchar,
                "parent_id" varchar,
                "owner_id" varchar,
                "last_pin_timestamp" integer,
                "default_auto_archive_duration" integer,
                "position" integer,
                "permission_overwrites" text,
                "video_quality_mode" integer,
                "bitrate" integer,
                "user_limit" integer,
                "nsfw" boolean,
                "rate_limit_per_user" integer,
                "topic" varchar,
                "retention_policy_id" varchar,
                "flags" integer,
                "default_thread_rate_limit_per_user" integer,
                CONSTRAINT "FK_c253dafe5f3a03ec00cd8fb4581" FOREIGN KEY ("guild_id") REFERENCES "guilds" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_3274522d14af40540b1a883fc80" FOREIGN KEY ("parent_id") REFERENCES "channels" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_3873ed438575cce703ecff4fc7b" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
		await queryRunner.query(`
            INSERT INTO "channels"(
                    "id",
                    "created_at",
                    "name",
                    "icon",
                    "type",
                    "last_message_id",
                    "guild_id",
                    "parent_id",
                    "owner_id",
                    "last_pin_timestamp",
                    "default_auto_archive_duration",
                    "position",
                    "permission_overwrites",
                    "video_quality_mode",
                    "bitrate",
                    "user_limit",
                    "nsfw",
                    "rate_limit_per_user",
                    "topic",
                    "retention_policy_id",
                    "flags",
                    "default_thread_rate_limit_per_user"
                )
            SELECT "id",
                "created_at",
                "name",
                "icon",
                "type",
                "last_message_id",
                "guild_id",
                "parent_id",
                "owner_id",
                "last_pin_timestamp",
                "default_auto_archive_duration",
                "position",
                "permission_overwrites",
                "video_quality_mode",
                "bitrate",
                "user_limit",
                "nsfw",
                "rate_limit_per_user",
                "topic",
                "retention_policy_id",
                "flags",
                "default_thread_rate_limit_per_user"
            FROM "temporary_channels"
        `);
		await queryRunner.query(`
            DROP TABLE "temporary_channels"
        `);
	}
}
