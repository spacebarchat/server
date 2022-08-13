import { MigrationInterface, QueryRunner } from "typeorm";

export class InvitersAreDeletable1660416010862 implements MigrationInterface {
    name = 'InvitersAreDeletable1660416010862'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "temporary_invites" (
                "code" varchar PRIMARY KEY NOT NULL,
                "temporary" boolean NOT NULL,
                "uses" integer NOT NULL,
                "max_uses" integer NOT NULL,
                "max_age" integer NOT NULL,
                "created_at" datetime NOT NULL,
                "expires_at" datetime NOT NULL,
                "guild_id" varchar,
                "channel_id" varchar,
                "inviter_id" varchar,
                "target_user_id" varchar,
                "target_user_type" integer,
                "vanity_url" boolean,
                CONSTRAINT "FK_11a0d394f8fc649c19ce5f16b59" FOREIGN KEY ("target_user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_6a15b051fe5050aa00a4b9ff0f6" FOREIGN KEY ("channel_id") REFERENCES "channels" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_3f4939aa1461e8af57fea3fb05d" FOREIGN KEY ("guild_id") REFERENCES "guilds" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_invites"(
                    "code",
                    "temporary",
                    "uses",
                    "max_uses",
                    "max_age",
                    "created_at",
                    "expires_at",
                    "guild_id",
                    "channel_id",
                    "inviter_id",
                    "target_user_id",
                    "target_user_type",
                    "vanity_url"
                )
            SELECT "code",
                "temporary",
                "uses",
                "max_uses",
                "max_age",
                "created_at",
                "expires_at",
                "guild_id",
                "channel_id",
                "inviter_id",
                "target_user_id",
                "target_user_type",
                "vanity_url"
            FROM "invites"
        `);
        await queryRunner.query(`
            DROP TABLE "invites"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_invites"
                RENAME TO "invites"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_invites" (
                "code" varchar PRIMARY KEY NOT NULL,
                "temporary" boolean NOT NULL,
                "uses" integer NOT NULL,
                "max_uses" integer NOT NULL,
                "max_age" integer NOT NULL,
                "created_at" datetime NOT NULL,
                "expires_at" datetime NOT NULL,
                "guild_id" varchar,
                "channel_id" varchar,
                "inviter_id" varchar,
                "target_user_id" varchar,
                "target_user_type" integer,
                "vanity_url" boolean,
                CONSTRAINT "FK_11a0d394f8fc649c19ce5f16b59" FOREIGN KEY ("target_user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_6a15b051fe5050aa00a4b9ff0f6" FOREIGN KEY ("channel_id") REFERENCES "channels" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_3f4939aa1461e8af57fea3fb05d" FOREIGN KEY ("guild_id") REFERENCES "guilds" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_15c35422032e0b22b4ada95f48f" FOREIGN KEY ("inviter_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_invites"(
                    "code",
                    "temporary",
                    "uses",
                    "max_uses",
                    "max_age",
                    "created_at",
                    "expires_at",
                    "guild_id",
                    "channel_id",
                    "inviter_id",
                    "target_user_id",
                    "target_user_type",
                    "vanity_url"
                )
            SELECT "code",
                "temporary",
                "uses",
                "max_uses",
                "max_age",
                "created_at",
                "expires_at",
                "guild_id",
                "channel_id",
                "inviter_id",
                "target_user_id",
                "target_user_type",
                "vanity_url"
            FROM "invites"
        `);
        await queryRunner.query(`
            DROP TABLE "invites"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_invites"
                RENAME TO "invites"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "invites"
                RENAME TO "temporary_invites"
        `);
        await queryRunner.query(`
            CREATE TABLE "invites" (
                "code" varchar PRIMARY KEY NOT NULL,
                "temporary" boolean NOT NULL,
                "uses" integer NOT NULL,
                "max_uses" integer NOT NULL,
                "max_age" integer NOT NULL,
                "created_at" datetime NOT NULL,
                "expires_at" datetime NOT NULL,
                "guild_id" varchar,
                "channel_id" varchar,
                "inviter_id" varchar,
                "target_user_id" varchar,
                "target_user_type" integer,
                "vanity_url" boolean,
                CONSTRAINT "FK_11a0d394f8fc649c19ce5f16b59" FOREIGN KEY ("target_user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_6a15b051fe5050aa00a4b9ff0f6" FOREIGN KEY ("channel_id") REFERENCES "channels" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_3f4939aa1461e8af57fea3fb05d" FOREIGN KEY ("guild_id") REFERENCES "guilds" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "invites"(
                    "code",
                    "temporary",
                    "uses",
                    "max_uses",
                    "max_age",
                    "created_at",
                    "expires_at",
                    "guild_id",
                    "channel_id",
                    "inviter_id",
                    "target_user_id",
                    "target_user_type",
                    "vanity_url"
                )
            SELECT "code",
                "temporary",
                "uses",
                "max_uses",
                "max_age",
                "created_at",
                "expires_at",
                "guild_id",
                "channel_id",
                "inviter_id",
                "target_user_id",
                "target_user_type",
                "vanity_url"
            FROM "temporary_invites"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_invites"
        `);
        await queryRunner.query(`
            ALTER TABLE "invites"
                RENAME TO "temporary_invites"
        `);
        await queryRunner.query(`
            CREATE TABLE "invites" (
                "code" varchar PRIMARY KEY NOT NULL,
                "temporary" boolean NOT NULL,
                "uses" integer NOT NULL,
                "max_uses" integer NOT NULL,
                "max_age" integer NOT NULL,
                "created_at" datetime NOT NULL,
                "expires_at" datetime NOT NULL,
                "guild_id" varchar,
                "channel_id" varchar,
                "inviter_id" varchar,
                "target_user_id" varchar,
                "target_user_type" integer,
                "vanity_url" boolean,
                CONSTRAINT "FK_11a0d394f8fc649c19ce5f16b59" FOREIGN KEY ("target_user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_15c35422032e0b22b4ada95f48f" FOREIGN KEY ("inviter_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_6a15b051fe5050aa00a4b9ff0f6" FOREIGN KEY ("channel_id") REFERENCES "channels" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_3f4939aa1461e8af57fea3fb05d" FOREIGN KEY ("guild_id") REFERENCES "guilds" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "invites"(
                    "code",
                    "temporary",
                    "uses",
                    "max_uses",
                    "max_age",
                    "created_at",
                    "expires_at",
                    "guild_id",
                    "channel_id",
                    "inviter_id",
                    "target_user_id",
                    "target_user_type",
                    "vanity_url"
                )
            SELECT "code",
                "temporary",
                "uses",
                "max_uses",
                "max_age",
                "created_at",
                "expires_at",
                "guild_id",
                "channel_id",
                "inviter_id",
                "target_user_id",
                "target_user_type",
                "vanity_url"
            FROM "temporary_invites"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_invites"
        `);
    }

}
