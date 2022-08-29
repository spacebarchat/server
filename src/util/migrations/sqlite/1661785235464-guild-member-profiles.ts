import { MigrationInterface, QueryRunner } from "typeorm";

export class guildMemberProfiles1661785235464 implements MigrationInterface {
    name = 'guildMemberProfiles1661785235464'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "IDX_bb2bf9386ac443afbbbf9f12d3"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_members" (
                "index" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "id" varchar NOT NULL,
                "guild_id" varchar NOT NULL,
                "nick" varchar,
                "joined_at" datetime NOT NULL,
                "premium_since" datetime,
                "deaf" boolean NOT NULL,
                "mute" boolean NOT NULL,
                "pending" boolean NOT NULL,
                "settings" text NOT NULL,
                "last_message_id" varchar,
                "joined_by" varchar,
                "avatar" varchar,
                "banner" varchar,
                "bio" varchar NOT NULL,
                "communication_disabled_until" datetime,
                CONSTRAINT "FK_28b53062261b996d9c99fa12404" FOREIGN KEY ("id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_16aceddd5b89825b8ed6029ad1c" FOREIGN KEY ("guild_id") REFERENCES "guilds" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_members"(
                    "index",
                    "id",
                    "guild_id",
                    "nick",
                    "joined_at",
                    "premium_since",
                    "deaf",
                    "mute",
                    "pending",
                    "settings",
                    "last_message_id",
                    "joined_by"
                )
            SELECT "index",
                "id",
                "guild_id",
                "nick",
                "joined_at",
                "premium_since",
                "deaf",
                "mute",
                "pending",
                "settings",
                "last_message_id",
                "joined_by"
            FROM "members"
        `);
        await queryRunner.query(`
            DROP TABLE "members"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_members"
                RENAME TO "members"
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_bb2bf9386ac443afbbbf9f12d3" ON "members" ("id", "guild_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "IDX_bb2bf9386ac443afbbbf9f12d3"
        `);
        await queryRunner.query(`
            ALTER TABLE "members"
                RENAME TO "temporary_members"
        `);
        await queryRunner.query(`
            CREATE TABLE "members" (
                "index" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "id" varchar NOT NULL,
                "guild_id" varchar NOT NULL,
                "nick" varchar,
                "joined_at" datetime NOT NULL,
                "premium_since" datetime,
                "deaf" boolean NOT NULL,
                "mute" boolean NOT NULL,
                "pending" boolean NOT NULL,
                "settings" text NOT NULL,
                "last_message_id" varchar,
                "joined_by" varchar,
                CONSTRAINT "FK_28b53062261b996d9c99fa12404" FOREIGN KEY ("id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_16aceddd5b89825b8ed6029ad1c" FOREIGN KEY ("guild_id") REFERENCES "guilds" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "members"(
                    "index",
                    "id",
                    "guild_id",
                    "nick",
                    "joined_at",
                    "premium_since",
                    "deaf",
                    "mute",
                    "pending",
                    "settings",
                    "last_message_id",
                    "joined_by"
                )
            SELECT "index",
                "id",
                "guild_id",
                "nick",
                "joined_at",
                "premium_since",
                "deaf",
                "mute",
                "pending",
                "settings",
                "last_message_id",
                "joined_by"
            FROM "temporary_members"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_members"
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_bb2bf9386ac443afbbbf9f12d3" ON "members" ("id", "guild_id")
        `);
    }

}
