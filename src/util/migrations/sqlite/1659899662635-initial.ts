import { MigrationInterface, QueryRunner } from "typeorm";

export class initial1659899662635 implements MigrationInterface {
    name = 'initial1659899662635'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "config" ("key" varchar PRIMARY KEY NOT NULL, "value" text)
        `);
        await queryRunner.query(`
            CREATE TABLE "relationships" (
                "id" varchar PRIMARY KEY NOT NULL,
                "from_id" varchar NOT NULL,
                "to_id" varchar NOT NULL,
                "nickname" varchar,
                "type" integer NOT NULL
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_a0b2ff0a598df0b0d055934a17" ON "relationships" ("from_id", "to_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "connected_accounts" (
                "id" varchar PRIMARY KEY NOT NULL,
                "user_id" varchar,
                "access_token" varchar NOT NULL,
                "friend_sync" boolean NOT NULL,
                "name" varchar NOT NULL,
                "revoked" boolean NOT NULL,
                "show_activity" boolean NOT NULL,
                "type" varchar NOT NULL,
                "verified" boolean NOT NULL,
                "visibility" integer NOT NULL
            )
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
            CREATE TABLE "backup_codes" (
                "id" varchar PRIMARY KEY NOT NULL,
                "code" varchar NOT NULL,
                "consumed" boolean NOT NULL,
                "expired" boolean NOT NULL,
                "user_id" varchar
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "bans" (
                "id" varchar PRIMARY KEY NOT NULL,
                "user_id" varchar,
                "guild_id" varchar,
                "executor_id" varchar,
                "ip" varchar NOT NULL,
                "reason" varchar
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "recipients" (
                "id" varchar PRIMARY KEY NOT NULL,
                "channel_id" varchar NOT NULL,
                "user_id" varchar NOT NULL,
                "closed" boolean NOT NULL DEFAULT (0)
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" varchar PRIMARY KEY NOT NULL,
                "guild_id" varchar,
                "color" integer NOT NULL,
                "hoist" boolean NOT NULL,
                "managed" boolean NOT NULL,
                "mentionable" boolean NOT NULL,
                "name" varchar NOT NULL,
                "permissions" varchar NOT NULL,
                "position" integer NOT NULL,
                "icon" varchar,
                "unicode_emoji" varchar,
                "tags" text
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "members" (
                "index" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "id" varchar NOT NULL,
                "guild_id" varchar NOT NULL,
                "nick" varchar,
                "joined_at" datetime NOT NULL,
                "premium_since" bigint,
                "deaf" boolean NOT NULL,
                "mute" boolean NOT NULL,
                "pending" boolean NOT NULL,
                "settings" text NOT NULL,
                "last_message_id" varchar,
                "joined_by" varchar
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_bb2bf9386ac443afbbbf9f12d3" ON "members" ("id", "guild_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "webhooks" (
                "id" varchar PRIMARY KEY NOT NULL,
                "type" integer NOT NULL,
                "name" varchar,
                "avatar" varchar,
                "token" varchar,
                "guild_id" varchar,
                "channel_id" varchar,
                "application_id" varchar,
                "user_id" varchar,
                "source_guild_id" varchar
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "stickers" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "description" varchar,
                "available" boolean,
                "tags" varchar,
                "pack_id" varchar,
                "guild_id" varchar,
                "user_id" varchar,
                "type" integer NOT NULL,
                "format_type" integer NOT NULL
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "attachments" (
                "id" varchar PRIMARY KEY NOT NULL,
                "filename" varchar NOT NULL,
                "size" integer NOT NULL,
                "url" varchar NOT NULL,
                "proxy_url" varchar NOT NULL,
                "height" integer,
                "width" integer,
                "content_type" varchar,
                "message_id" varchar
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "messages" (
                "id" varchar PRIMARY KEY NOT NULL,
                "channel_id" varchar,
                "guild_id" varchar,
                "author_id" varchar,
                "member_id" varchar,
                "webhook_id" varchar,
                "application_id" varchar,
                "content" varchar,
                "timestamp" datetime NOT NULL DEFAULT (datetime('now')),
                "edited_timestamp" datetime,
                "tts" boolean,
                "mention_everyone" boolean,
                "embeds" text NOT NULL,
                "reactions" text NOT NULL,
                "nonce" text,
                "pinned" boolean,
                "type" integer NOT NULL,
                "activity" text,
                "flags" varchar,
                "message_reference" text,
                "interaction" text,
                "components" text,
                "message_reference_id" varchar
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_86b9109b155eb70c0a2ca3b4b6" ON "messages" ("channel_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_05535bc695e9f7ee104616459d" ON "messages" ("author_id")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_3ed7a60fb7dbe04e1ba9332a8b" ON "messages" ("channel_id", "id")
        `);
        await queryRunner.query(`
            CREATE TABLE "read_states" (
                "id" varchar PRIMARY KEY NOT NULL,
                "channel_id" varchar NOT NULL,
                "user_id" varchar NOT NULL,
                "last_message_id" varchar,
                "public_ack" varchar,
                "notifications_cursor" varchar,
                "last_pin_timestamp" datetime,
                "mention_count" integer
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_0abf8b443321bd3cf7f81ee17a" ON "read_states" ("channel_id", "user_id")
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
                "vanity_url" boolean
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "voice_states" (
                "id" varchar PRIMARY KEY NOT NULL,
                "guild_id" varchar,
                "channel_id" varchar,
                "user_id" varchar,
                "session_id" varchar NOT NULL,
                "token" varchar,
                "deaf" boolean NOT NULL,
                "mute" boolean NOT NULL,
                "self_deaf" boolean NOT NULL,
                "self_mute" boolean NOT NULL,
                "self_stream" boolean,
                "self_video" boolean NOT NULL,
                "suppress" boolean NOT NULL,
                "request_to_speak_timestamp" datetime
            )
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
                "retention_policy_id" varchar
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "emojis" (
                "id" varchar PRIMARY KEY NOT NULL,
                "animated" boolean NOT NULL,
                "available" boolean NOT NULL,
                "guild_id" varchar NOT NULL,
                "user_id" varchar,
                "managed" boolean NOT NULL,
                "name" varchar NOT NULL,
                "require_colons" boolean NOT NULL,
                "roles" text NOT NULL,
                "groups" text
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "templates" (
                "id" varchar PRIMARY KEY NOT NULL,
                "code" varchar NOT NULL,
                "name" varchar NOT NULL,
                "description" varchar,
                "usage_count" integer,
                "creator_id" varchar,
                "created_at" datetime NOT NULL,
                "updated_at" datetime NOT NULL,
                "source_guild_id" varchar,
                "serialized_source_guild" text NOT NULL,
                CONSTRAINT "UQ_be38737bf339baf63b1daeffb55" UNIQUE ("code")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "guilds" (
                "id" varchar PRIMARY KEY NOT NULL,
                "afk_channel_id" varchar,
                "afk_timeout" integer,
                "banner" varchar,
                "default_message_notifications" integer,
                "description" varchar,
                "discovery_splash" varchar,
                "explicit_content_filter" integer,
                "features" text NOT NULL,
                "primary_category_id" integer,
                "icon" varchar,
                "large" boolean,
                "max_members" integer,
                "max_presences" integer,
                "max_video_channel_users" integer,
                "member_count" integer,
                "presence_count" integer,
                "template_id" varchar,
                "mfa_level" integer,
                "name" varchar NOT NULL,
                "owner_id" varchar,
                "preferred_locale" varchar,
                "premium_subscription_count" integer,
                "premium_tier" integer,
                "public_updates_channel_id" varchar,
                "rules_channel_id" varchar,
                "region" varchar,
                "splash" varchar,
                "system_channel_id" varchar,
                "system_channel_flags" integer,
                "unavailable" boolean,
                "verification_level" integer,
                "welcome_screen" text NOT NULL,
                "widget_channel_id" varchar,
                "widget_enabled" boolean,
                "nsfw_level" integer,
                "nsfw" boolean,
                "parent" varchar
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "team_members" (
                "id" varchar PRIMARY KEY NOT NULL,
                "membership_state" integer NOT NULL,
                "permissions" text NOT NULL,
                "team_id" varchar,
                "user_id" varchar
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "teams" (
                "id" varchar PRIMARY KEY NOT NULL,
                "icon" varchar,
                "name" varchar NOT NULL,
                "owner_user_id" varchar
            )
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
                "guild_id" varchar
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "audit_logs" (
                "id" varchar PRIMARY KEY NOT NULL,
                "user_id" varchar,
                "action_type" integer NOT NULL,
                "options" text,
                "changes" text NOT NULL,
                "reason" varchar,
                "target_id" varchar
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "categories" (
                "id" integer PRIMARY KEY NOT NULL,
                "name" varchar,
                "localizations" text NOT NULL,
                "is_primary" boolean
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "rate_limits" (
                "id" varchar PRIMARY KEY NOT NULL,
                "executor_id" varchar NOT NULL,
                "hits" integer NOT NULL,
                "blocked" boolean NOT NULL,
                "expires_at" datetime NOT NULL
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "sessions" (
                "id" varchar PRIMARY KEY NOT NULL,
                "user_id" varchar,
                "session_id" varchar NOT NULL,
                "activities" text,
                "client_info" text NOT NULL,
                "status" varchar NOT NULL
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "sticker_packs" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "description" varchar,
                "banner_asset_id" varchar,
                "cover_sticker_id" varchar,
                "coverStickerId" varchar
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "client_release" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "pub_date" varchar NOT NULL,
                "url" varchar NOT NULL,
                "deb_url" varchar NOT NULL,
                "osx_url" varchar NOT NULL,
                "win_url" varchar NOT NULL,
                "notes" varchar
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "notes" (
                "id" varchar PRIMARY KEY NOT NULL,
                "content" varchar NOT NULL,
                "owner_id" varchar,
                "target_id" varchar,
                CONSTRAINT "UQ_74e6689b9568cc965b8bfc9150b" UNIQUE ("owner_id", "target_id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "member_roles" (
                "index" integer NOT NULL,
                "role_id" varchar NOT NULL,
                PRIMARY KEY ("index", "role_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_5d7ddc8a5f9c167f548625e772" ON "member_roles" ("index")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e9080e7a7997a0170026d5139c" ON "member_roles" ("role_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "message_user_mentions" (
                "messagesId" varchar NOT NULL,
                "usersId" varchar NOT NULL,
                PRIMARY KEY ("messagesId", "usersId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a343387fc560ef378760681c23" ON "message_user_mentions" ("messagesId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b831eb18ceebd28976239b1e2f" ON "message_user_mentions" ("usersId")
        `);
        await queryRunner.query(`
            CREATE TABLE "message_role_mentions" (
                "messagesId" varchar NOT NULL,
                "rolesId" varchar NOT NULL,
                PRIMARY KEY ("messagesId", "rolesId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a8242cf535337a490b0feaea0b" ON "message_role_mentions" ("messagesId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_29d63eb1a458200851bc37d074" ON "message_role_mentions" ("rolesId")
        `);
        await queryRunner.query(`
            CREATE TABLE "message_channel_mentions" (
                "messagesId" varchar NOT NULL,
                "channelsId" varchar NOT NULL,
                PRIMARY KEY ("messagesId", "channelsId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_2a27102ecd1d81b4582a436092" ON "message_channel_mentions" ("messagesId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_bdb8c09e1464cabf62105bf4b9" ON "message_channel_mentions" ("channelsId")
        `);
        await queryRunner.query(`
            CREATE TABLE "message_stickers" (
                "messagesId" varchar NOT NULL,
                "stickersId" varchar NOT NULL,
                PRIMARY KEY ("messagesId", "stickersId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_40bb6f23e7cc133292e92829d2" ON "message_stickers" ("messagesId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e22a70819d07659c7a71c112a1" ON "message_stickers" ("stickersId")
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_a0b2ff0a598df0b0d055934a17"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_relationships" (
                "id" varchar PRIMARY KEY NOT NULL,
                "from_id" varchar NOT NULL,
                "to_id" varchar NOT NULL,
                "nickname" varchar,
                "type" integer NOT NULL,
                CONSTRAINT "FK_9af4194bab1250b1c584ae4f1d7" FOREIGN KEY ("from_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_9c7f6b98a9843b76dce1b0c878b" FOREIGN KEY ("to_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_relationships"("id", "from_id", "to_id", "nickname", "type")
            SELECT "id",
                "from_id",
                "to_id",
                "nickname",
                "type"
            FROM "relationships"
        `);
        await queryRunner.query(`
            DROP TABLE "relationships"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_relationships"
                RENAME TO "relationships"
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_a0b2ff0a598df0b0d055934a17" ON "relationships" ("from_id", "to_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_connected_accounts" (
                "id" varchar PRIMARY KEY NOT NULL,
                "user_id" varchar,
                "access_token" varchar NOT NULL,
                "friend_sync" boolean NOT NULL,
                "name" varchar NOT NULL,
                "revoked" boolean NOT NULL,
                "show_activity" boolean NOT NULL,
                "type" varchar NOT NULL,
                "verified" boolean NOT NULL,
                "visibility" integer NOT NULL,
                CONSTRAINT "FK_f47244225a6a1eac04a3463dd90" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_connected_accounts"(
                    "id",
                    "user_id",
                    "access_token",
                    "friend_sync",
                    "name",
                    "revoked",
                    "show_activity",
                    "type",
                    "verified",
                    "visibility"
                )
            SELECT "id",
                "user_id",
                "access_token",
                "friend_sync",
                "name",
                "revoked",
                "show_activity",
                "type",
                "verified",
                "visibility"
            FROM "connected_accounts"
        `);
        await queryRunner.query(`
            DROP TABLE "connected_accounts"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_connected_accounts"
                RENAME TO "connected_accounts"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_backup_codes" (
                "id" varchar PRIMARY KEY NOT NULL,
                "code" varchar NOT NULL,
                "consumed" boolean NOT NULL,
                "expired" boolean NOT NULL,
                "user_id" varchar,
                CONSTRAINT "FK_70066ea80d2f4b871beda32633b" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_backup_codes"("id", "code", "consumed", "expired", "user_id")
            SELECT "id",
                "code",
                "consumed",
                "expired",
                "user_id"
            FROM "backup_codes"
        `);
        await queryRunner.query(`
            DROP TABLE "backup_codes"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_backup_codes"
                RENAME TO "backup_codes"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_bans" (
                "id" varchar PRIMARY KEY NOT NULL,
                "user_id" varchar,
                "guild_id" varchar,
                "executor_id" varchar,
                "ip" varchar NOT NULL,
                "reason" varchar,
                CONSTRAINT "FK_5999e8e449f80a236ff72023559" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_9d3ab7dd180ebdd245cdb66ecad" FOREIGN KEY ("guild_id") REFERENCES "guilds" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_07ad88c86d1f290d46748410d58" FOREIGN KEY ("executor_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_bans"(
                    "id",
                    "user_id",
                    "guild_id",
                    "executor_id",
                    "ip",
                    "reason"
                )
            SELECT "id",
                "user_id",
                "guild_id",
                "executor_id",
                "ip",
                "reason"
            FROM "bans"
        `);
        await queryRunner.query(`
            DROP TABLE "bans"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_bans"
                RENAME TO "bans"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_recipients" (
                "id" varchar PRIMARY KEY NOT NULL,
                "channel_id" varchar NOT NULL,
                "user_id" varchar NOT NULL,
                "closed" boolean NOT NULL DEFAULT (0),
                CONSTRAINT "FK_2f18ee1ba667f233ae86c0ea60e" FOREIGN KEY ("channel_id") REFERENCES "channels" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_6157e8b6ba4e6e3089616481fe2" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_recipients"("id", "channel_id", "user_id", "closed")
            SELECT "id",
                "channel_id",
                "user_id",
                "closed"
            FROM "recipients"
        `);
        await queryRunner.query(`
            DROP TABLE "recipients"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_recipients"
                RENAME TO "recipients"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_roles" (
                "id" varchar PRIMARY KEY NOT NULL,
                "guild_id" varchar,
                "color" integer NOT NULL,
                "hoist" boolean NOT NULL,
                "managed" boolean NOT NULL,
                "mentionable" boolean NOT NULL,
                "name" varchar NOT NULL,
                "permissions" varchar NOT NULL,
                "position" integer NOT NULL,
                "icon" varchar,
                "unicode_emoji" varchar,
                "tags" text,
                CONSTRAINT "FK_c32c1ab1c4dc7dcb0278c4b1b8b" FOREIGN KEY ("guild_id") REFERENCES "guilds" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_roles"(
                    "id",
                    "guild_id",
                    "color",
                    "hoist",
                    "managed",
                    "mentionable",
                    "name",
                    "permissions",
                    "position",
                    "icon",
                    "unicode_emoji",
                    "tags"
                )
            SELECT "id",
                "guild_id",
                "color",
                "hoist",
                "managed",
                "mentionable",
                "name",
                "permissions",
                "position",
                "icon",
                "unicode_emoji",
                "tags"
            FROM "roles"
        `);
        await queryRunner.query(`
            DROP TABLE "roles"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_roles"
                RENAME TO "roles"
        `);
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
                "premium_since" bigint,
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
        await queryRunner.query(`
            CREATE TABLE "temporary_webhooks" (
                "id" varchar PRIMARY KEY NOT NULL,
                "type" integer NOT NULL,
                "name" varchar,
                "avatar" varchar,
                "token" varchar,
                "guild_id" varchar,
                "channel_id" varchar,
                "application_id" varchar,
                "user_id" varchar,
                "source_guild_id" varchar,
                CONSTRAINT "FK_487a7af59d189f744fe394368fc" FOREIGN KEY ("guild_id") REFERENCES "guilds" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_df528cf77e82f8032230e7e37d8" FOREIGN KEY ("channel_id") REFERENCES "channels" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_c3e5305461931763b56aa905f1c" FOREIGN KEY ("application_id") REFERENCES "applications" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_0d523f6f997c86e052c49b1455f" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_3a285f4f49c40e0706d3018bc9f" FOREIGN KEY ("source_guild_id") REFERENCES "guilds" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_webhooks"(
                    "id",
                    "type",
                    "name",
                    "avatar",
                    "token",
                    "guild_id",
                    "channel_id",
                    "application_id",
                    "user_id",
                    "source_guild_id"
                )
            SELECT "id",
                "type",
                "name",
                "avatar",
                "token",
                "guild_id",
                "channel_id",
                "application_id",
                "user_id",
                "source_guild_id"
            FROM "webhooks"
        `);
        await queryRunner.query(`
            DROP TABLE "webhooks"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_webhooks"
                RENAME TO "webhooks"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_stickers" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "description" varchar,
                "available" boolean,
                "tags" varchar,
                "pack_id" varchar,
                "guild_id" varchar,
                "user_id" varchar,
                "type" integer NOT NULL,
                "format_type" integer NOT NULL,
                CONSTRAINT "FK_e7cfa5cefa6661b3fb8fda8ce69" FOREIGN KEY ("pack_id") REFERENCES "sticker_packs" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_193d551d852aca5347ef5c9f205" FOREIGN KEY ("guild_id") REFERENCES "guilds" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_8f4ee73f2bb2325ff980502e158" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_stickers"(
                    "id",
                    "name",
                    "description",
                    "available",
                    "tags",
                    "pack_id",
                    "guild_id",
                    "user_id",
                    "type",
                    "format_type"
                )
            SELECT "id",
                "name",
                "description",
                "available",
                "tags",
                "pack_id",
                "guild_id",
                "user_id",
                "type",
                "format_type"
            FROM "stickers"
        `);
        await queryRunner.query(`
            DROP TABLE "stickers"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_stickers"
                RENAME TO "stickers"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_attachments" (
                "id" varchar PRIMARY KEY NOT NULL,
                "filename" varchar NOT NULL,
                "size" integer NOT NULL,
                "url" varchar NOT NULL,
                "proxy_url" varchar NOT NULL,
                "height" integer,
                "width" integer,
                "content_type" varchar,
                "message_id" varchar,
                CONSTRAINT "FK_623e10eec51ada466c5038979e3" FOREIGN KEY ("message_id") REFERENCES "messages" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_attachments"(
                    "id",
                    "filename",
                    "size",
                    "url",
                    "proxy_url",
                    "height",
                    "width",
                    "content_type",
                    "message_id"
                )
            SELECT "id",
                "filename",
                "size",
                "url",
                "proxy_url",
                "height",
                "width",
                "content_type",
                "message_id"
            FROM "attachments"
        `);
        await queryRunner.query(`
            DROP TABLE "attachments"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_attachments"
                RENAME TO "attachments"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_86b9109b155eb70c0a2ca3b4b6"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_05535bc695e9f7ee104616459d"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_3ed7a60fb7dbe04e1ba9332a8b"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_messages" (
                "id" varchar PRIMARY KEY NOT NULL,
                "channel_id" varchar,
                "guild_id" varchar,
                "author_id" varchar,
                "member_id" varchar,
                "webhook_id" varchar,
                "application_id" varchar,
                "content" varchar,
                "timestamp" datetime NOT NULL DEFAULT (datetime('now')),
                "edited_timestamp" datetime,
                "tts" boolean,
                "mention_everyone" boolean,
                "embeds" text NOT NULL,
                "reactions" text NOT NULL,
                "nonce" text,
                "pinned" boolean,
                "type" integer NOT NULL,
                "activity" text,
                "flags" varchar,
                "message_reference" text,
                "interaction" text,
                "components" text,
                "message_reference_id" varchar,
                CONSTRAINT "FK_86b9109b155eb70c0a2ca3b4b6d" FOREIGN KEY ("channel_id") REFERENCES "channels" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_b193588441b085352a4c0109423" FOREIGN KEY ("guild_id") REFERENCES "guilds" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_05535bc695e9f7ee104616459d3" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_b0525304f2262b7014245351c76" FOREIGN KEY ("member_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_f83c04bcf1df4e5c0e7a52ed348" FOREIGN KEY ("webhook_id") REFERENCES "webhooks" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_5d3ec1cb962de6488637fd779d6" FOREIGN KEY ("application_id") REFERENCES "applications" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_61a92bb65b302a76d9c1fcd3174" FOREIGN KEY ("message_reference_id") REFERENCES "messages" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_messages"(
                    "id",
                    "channel_id",
                    "guild_id",
                    "author_id",
                    "member_id",
                    "webhook_id",
                    "application_id",
                    "content",
                    "timestamp",
                    "edited_timestamp",
                    "tts",
                    "mention_everyone",
                    "embeds",
                    "reactions",
                    "nonce",
                    "pinned",
                    "type",
                    "activity",
                    "flags",
                    "message_reference",
                    "interaction",
                    "components",
                    "message_reference_id"
                )
            SELECT "id",
                "channel_id",
                "guild_id",
                "author_id",
                "member_id",
                "webhook_id",
                "application_id",
                "content",
                "timestamp",
                "edited_timestamp",
                "tts",
                "mention_everyone",
                "embeds",
                "reactions",
                "nonce",
                "pinned",
                "type",
                "activity",
                "flags",
                "message_reference",
                "interaction",
                "components",
                "message_reference_id"
            FROM "messages"
        `);
        await queryRunner.query(`
            DROP TABLE "messages"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_messages"
                RENAME TO "messages"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_86b9109b155eb70c0a2ca3b4b6" ON "messages" ("channel_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_05535bc695e9f7ee104616459d" ON "messages" ("author_id")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_3ed7a60fb7dbe04e1ba9332a8b" ON "messages" ("channel_id", "id")
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_0abf8b443321bd3cf7f81ee17a"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_read_states" (
                "id" varchar PRIMARY KEY NOT NULL,
                "channel_id" varchar NOT NULL,
                "user_id" varchar NOT NULL,
                "last_message_id" varchar,
                "public_ack" varchar,
                "notifications_cursor" varchar,
                "last_pin_timestamp" datetime,
                "mention_count" integer,
                CONSTRAINT "FK_40da2fca4e0eaf7a23b5bfc5d34" FOREIGN KEY ("channel_id") REFERENCES "channels" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_195f92e4dd1254a4e348c043763" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_read_states"(
                    "id",
                    "channel_id",
                    "user_id",
                    "last_message_id",
                    "public_ack",
                    "notifications_cursor",
                    "last_pin_timestamp",
                    "mention_count"
                )
            SELECT "id",
                "channel_id",
                "user_id",
                "last_message_id",
                "public_ack",
                "notifications_cursor",
                "last_pin_timestamp",
                "mention_count"
            FROM "read_states"
        `);
        await queryRunner.query(`
            DROP TABLE "read_states"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_read_states"
                RENAME TO "read_states"
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_0abf8b443321bd3cf7f81ee17a" ON "read_states" ("channel_id", "user_id")
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
                CONSTRAINT "FK_3f4939aa1461e8af57fea3fb05d" FOREIGN KEY ("guild_id") REFERENCES "guilds" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_6a15b051fe5050aa00a4b9ff0f6" FOREIGN KEY ("channel_id") REFERENCES "channels" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_15c35422032e0b22b4ada95f48f" FOREIGN KEY ("inviter_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_11a0d394f8fc649c19ce5f16b59" FOREIGN KEY ("target_user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
            CREATE TABLE "temporary_voice_states" (
                "id" varchar PRIMARY KEY NOT NULL,
                "guild_id" varchar,
                "channel_id" varchar,
                "user_id" varchar,
                "session_id" varchar NOT NULL,
                "token" varchar,
                "deaf" boolean NOT NULL,
                "mute" boolean NOT NULL,
                "self_deaf" boolean NOT NULL,
                "self_mute" boolean NOT NULL,
                "self_stream" boolean,
                "self_video" boolean NOT NULL,
                "suppress" boolean NOT NULL,
                "request_to_speak_timestamp" datetime,
                CONSTRAINT "FK_03779ef216d4b0358470d9cb748" FOREIGN KEY ("guild_id") REFERENCES "guilds" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_9f8d389866b40b6657edd026dd4" FOREIGN KEY ("channel_id") REFERENCES "channels" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_5fe1d5f931a67e85039c640001b" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_voice_states"(
                    "id",
                    "guild_id",
                    "channel_id",
                    "user_id",
                    "session_id",
                    "token",
                    "deaf",
                    "mute",
                    "self_deaf",
                    "self_mute",
                    "self_stream",
                    "self_video",
                    "suppress",
                    "request_to_speak_timestamp"
                )
            SELECT "id",
                "guild_id",
                "channel_id",
                "user_id",
                "session_id",
                "token",
                "deaf",
                "mute",
                "self_deaf",
                "self_mute",
                "self_stream",
                "self_video",
                "suppress",
                "request_to_speak_timestamp"
            FROM "voice_states"
        `);
        await queryRunner.query(`
            DROP TABLE "voice_states"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_voice_states"
                RENAME TO "voice_states"
        `);
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
                    "retention_policy_id"
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
                "retention_policy_id"
            FROM "channels"
        `);
        await queryRunner.query(`
            DROP TABLE "channels"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_channels"
                RENAME TO "channels"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_emojis" (
                "id" varchar PRIMARY KEY NOT NULL,
                "animated" boolean NOT NULL,
                "available" boolean NOT NULL,
                "guild_id" varchar NOT NULL,
                "user_id" varchar,
                "managed" boolean NOT NULL,
                "name" varchar NOT NULL,
                "require_colons" boolean NOT NULL,
                "roles" text NOT NULL,
                "groups" text,
                CONSTRAINT "FK_4b988e0db89d94cebcf07f598cc" FOREIGN KEY ("guild_id") REFERENCES "guilds" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_fa7ddd5f9a214e28ce596548421" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_emojis"(
                    "id",
                    "animated",
                    "available",
                    "guild_id",
                    "user_id",
                    "managed",
                    "name",
                    "require_colons",
                    "roles",
                    "groups"
                )
            SELECT "id",
                "animated",
                "available",
                "guild_id",
                "user_id",
                "managed",
                "name",
                "require_colons",
                "roles",
                "groups"
            FROM "emojis"
        `);
        await queryRunner.query(`
            DROP TABLE "emojis"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_emojis"
                RENAME TO "emojis"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_templates" (
                "id" varchar PRIMARY KEY NOT NULL,
                "code" varchar NOT NULL,
                "name" varchar NOT NULL,
                "description" varchar,
                "usage_count" integer,
                "creator_id" varchar,
                "created_at" datetime NOT NULL,
                "updated_at" datetime NOT NULL,
                "source_guild_id" varchar,
                "serialized_source_guild" text NOT NULL,
                CONSTRAINT "UQ_be38737bf339baf63b1daeffb55" UNIQUE ("code"),
                CONSTRAINT "FK_d7374b7f8f5fbfdececa4fb62e1" FOREIGN KEY ("creator_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_445d00eaaea0e60a017a5ed0c11" FOREIGN KEY ("source_guild_id") REFERENCES "guilds" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_templates"(
                    "id",
                    "code",
                    "name",
                    "description",
                    "usage_count",
                    "creator_id",
                    "created_at",
                    "updated_at",
                    "source_guild_id",
                    "serialized_source_guild"
                )
            SELECT "id",
                "code",
                "name",
                "description",
                "usage_count",
                "creator_id",
                "created_at",
                "updated_at",
                "source_guild_id",
                "serialized_source_guild"
            FROM "templates"
        `);
        await queryRunner.query(`
            DROP TABLE "templates"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_templates"
                RENAME TO "templates"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_guilds" (
                "id" varchar PRIMARY KEY NOT NULL,
                "afk_channel_id" varchar,
                "afk_timeout" integer,
                "banner" varchar,
                "default_message_notifications" integer,
                "description" varchar,
                "discovery_splash" varchar,
                "explicit_content_filter" integer,
                "features" text NOT NULL,
                "primary_category_id" integer,
                "icon" varchar,
                "large" boolean,
                "max_members" integer,
                "max_presences" integer,
                "max_video_channel_users" integer,
                "member_count" integer,
                "presence_count" integer,
                "template_id" varchar,
                "mfa_level" integer,
                "name" varchar NOT NULL,
                "owner_id" varchar,
                "preferred_locale" varchar,
                "premium_subscription_count" integer,
                "premium_tier" integer,
                "public_updates_channel_id" varchar,
                "rules_channel_id" varchar,
                "region" varchar,
                "splash" varchar,
                "system_channel_id" varchar,
                "system_channel_flags" integer,
                "unavailable" boolean,
                "verification_level" integer,
                "welcome_screen" text NOT NULL,
                "widget_channel_id" varchar,
                "widget_enabled" boolean,
                "nsfw_level" integer,
                "nsfw" boolean,
                "parent" varchar,
                CONSTRAINT "FK_f591a66b8019d87b0fe6c12dad6" FOREIGN KEY ("afk_channel_id") REFERENCES "channels" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_e2a2f873a64a5cf62526de42325" FOREIGN KEY ("template_id") REFERENCES "templates" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_fc1a451727e3643ca572a3bb394" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_8d450b016dc8bec35f36729e4b0" FOREIGN KEY ("public_updates_channel_id") REFERENCES "channels" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_95828668aa333460582e0ca6396" FOREIGN KEY ("rules_channel_id") REFERENCES "channels" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_cfc3d3ad260f8121c95b31a1fce" FOREIGN KEY ("system_channel_id") REFERENCES "channels" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_9d1d665379eefde7876a17afa99" FOREIGN KEY ("widget_channel_id") REFERENCES "channels" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_guilds"(
                    "id",
                    "afk_channel_id",
                    "afk_timeout",
                    "banner",
                    "default_message_notifications",
                    "description",
                    "discovery_splash",
                    "explicit_content_filter",
                    "features",
                    "primary_category_id",
                    "icon",
                    "large",
                    "max_members",
                    "max_presences",
                    "max_video_channel_users",
                    "member_count",
                    "presence_count",
                    "template_id",
                    "mfa_level",
                    "name",
                    "owner_id",
                    "preferred_locale",
                    "premium_subscription_count",
                    "premium_tier",
                    "public_updates_channel_id",
                    "rules_channel_id",
                    "region",
                    "splash",
                    "system_channel_id",
                    "system_channel_flags",
                    "unavailable",
                    "verification_level",
                    "welcome_screen",
                    "widget_channel_id",
                    "widget_enabled",
                    "nsfw_level",
                    "nsfw",
                    "parent"
                )
            SELECT "id",
                "afk_channel_id",
                "afk_timeout",
                "banner",
                "default_message_notifications",
                "description",
                "discovery_splash",
                "explicit_content_filter",
                "features",
                "primary_category_id",
                "icon",
                "large",
                "max_members",
                "max_presences",
                "max_video_channel_users",
                "member_count",
                "presence_count",
                "template_id",
                "mfa_level",
                "name",
                "owner_id",
                "preferred_locale",
                "premium_subscription_count",
                "premium_tier",
                "public_updates_channel_id",
                "rules_channel_id",
                "region",
                "splash",
                "system_channel_id",
                "system_channel_flags",
                "unavailable",
                "verification_level",
                "welcome_screen",
                "widget_channel_id",
                "widget_enabled",
                "nsfw_level",
                "nsfw",
                "parent"
            FROM "guilds"
        `);
        await queryRunner.query(`
            DROP TABLE "guilds"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_guilds"
                RENAME TO "guilds"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_team_members" (
                "id" varchar PRIMARY KEY NOT NULL,
                "membership_state" integer NOT NULL,
                "permissions" text NOT NULL,
                "team_id" varchar,
                "user_id" varchar,
                CONSTRAINT "FK_fdad7d5768277e60c40e01cdcea" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_c2bf4967c8c2a6b845dadfbf3d4" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_team_members"(
                    "id",
                    "membership_state",
                    "permissions",
                    "team_id",
                    "user_id"
                )
            SELECT "id",
                "membership_state",
                "permissions",
                "team_id",
                "user_id"
            FROM "team_members"
        `);
        await queryRunner.query(`
            DROP TABLE "team_members"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_team_members"
                RENAME TO "team_members"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_teams" (
                "id" varchar PRIMARY KEY NOT NULL,
                "icon" varchar,
                "name" varchar NOT NULL,
                "owner_user_id" varchar,
                CONSTRAINT "FK_13f00abf7cb6096c43ecaf8c108" FOREIGN KEY ("owner_user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_teams"("id", "icon", "name", "owner_user_id")
            SELECT "id",
                "icon",
                "name",
                "owner_user_id"
            FROM "teams"
        `);
        await queryRunner.query(`
            DROP TABLE "teams"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_teams"
                RENAME TO "teams"
        `);
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
                CONSTRAINT "FK_e57508958bf92b9d9d25231b5e8" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_a36ed02953077f408d0f3ebc424" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_e5bf78cdbbe9ba91062d74c5aba" FOREIGN KEY ("guild_id") REFERENCES "guilds" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            CREATE TABLE "temporary_audit_logs" (
                "id" varchar PRIMARY KEY NOT NULL,
                "user_id" varchar,
                "action_type" integer NOT NULL,
                "options" text,
                "changes" text NOT NULL,
                "reason" varchar,
                "target_id" varchar,
                CONSTRAINT "FK_3cd01cd3ae7aab010310d96ac8e" FOREIGN KEY ("target_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_audit_logs"(
                    "id",
                    "user_id",
                    "action_type",
                    "options",
                    "changes",
                    "reason",
                    "target_id"
                )
            SELECT "id",
                "user_id",
                "action_type",
                "options",
                "changes",
                "reason",
                "target_id"
            FROM "audit_logs"
        `);
        await queryRunner.query(`
            DROP TABLE "audit_logs"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_audit_logs"
                RENAME TO "audit_logs"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_sessions" (
                "id" varchar PRIMARY KEY NOT NULL,
                "user_id" varchar,
                "session_id" varchar NOT NULL,
                "activities" text,
                "client_info" text NOT NULL,
                "status" varchar NOT NULL,
                CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_sessions"(
                    "id",
                    "user_id",
                    "session_id",
                    "activities",
                    "client_info",
                    "status"
                )
            SELECT "id",
                "user_id",
                "session_id",
                "activities",
                "client_info",
                "status"
            FROM "sessions"
        `);
        await queryRunner.query(`
            DROP TABLE "sessions"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_sessions"
                RENAME TO "sessions"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_sticker_packs" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "description" varchar,
                "banner_asset_id" varchar,
                "cover_sticker_id" varchar,
                "coverStickerId" varchar,
                CONSTRAINT "FK_448fafba4355ee1c837bbc865f1" FOREIGN KEY ("coverStickerId") REFERENCES "stickers" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_sticker_packs"(
                    "id",
                    "name",
                    "description",
                    "banner_asset_id",
                    "cover_sticker_id",
                    "coverStickerId"
                )
            SELECT "id",
                "name",
                "description",
                "banner_asset_id",
                "cover_sticker_id",
                "coverStickerId"
            FROM "sticker_packs"
        `);
        await queryRunner.query(`
            DROP TABLE "sticker_packs"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_sticker_packs"
                RENAME TO "sticker_packs"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_notes" (
                "id" varchar PRIMARY KEY NOT NULL,
                "content" varchar NOT NULL,
                "owner_id" varchar,
                "target_id" varchar,
                CONSTRAINT "UQ_74e6689b9568cc965b8bfc9150b" UNIQUE ("owner_id", "target_id"),
                CONSTRAINT "FK_f9e103f8ae67cb1787063597925" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_23e08e5b4481711d573e1abecdc" FOREIGN KEY ("target_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_notes"("id", "content", "owner_id", "target_id")
            SELECT "id",
                "content",
                "owner_id",
                "target_id"
            FROM "notes"
        `);
        await queryRunner.query(`
            DROP TABLE "notes"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_notes"
                RENAME TO "notes"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_5d7ddc8a5f9c167f548625e772"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_e9080e7a7997a0170026d5139c"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_member_roles" (
                "index" integer NOT NULL,
                "role_id" varchar NOT NULL,
                CONSTRAINT "FK_5d7ddc8a5f9c167f548625e772e" FOREIGN KEY ("index") REFERENCES "members" ("index") ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT "FK_e9080e7a7997a0170026d5139c1" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
                PRIMARY KEY ("index", "role_id")
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_member_roles"("index", "role_id")
            SELECT "index",
                "role_id"
            FROM "member_roles"
        `);
        await queryRunner.query(`
            DROP TABLE "member_roles"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_member_roles"
                RENAME TO "member_roles"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_5d7ddc8a5f9c167f548625e772" ON "member_roles" ("index")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e9080e7a7997a0170026d5139c" ON "member_roles" ("role_id")
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_a343387fc560ef378760681c23"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_b831eb18ceebd28976239b1e2f"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_message_user_mentions" (
                "messagesId" varchar NOT NULL,
                "usersId" varchar NOT NULL,
                CONSTRAINT "FK_a343387fc560ef378760681c236" FOREIGN KEY ("messagesId") REFERENCES "messages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT "FK_b831eb18ceebd28976239b1e2f8" FOREIGN KEY ("usersId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
                PRIMARY KEY ("messagesId", "usersId")
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_message_user_mentions"("messagesId", "usersId")
            SELECT "messagesId",
                "usersId"
            FROM "message_user_mentions"
        `);
        await queryRunner.query(`
            DROP TABLE "message_user_mentions"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_message_user_mentions"
                RENAME TO "message_user_mentions"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a343387fc560ef378760681c23" ON "message_user_mentions" ("messagesId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b831eb18ceebd28976239b1e2f" ON "message_user_mentions" ("usersId")
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_a8242cf535337a490b0feaea0b"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_29d63eb1a458200851bc37d074"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_message_role_mentions" (
                "messagesId" varchar NOT NULL,
                "rolesId" varchar NOT NULL,
                CONSTRAINT "FK_a8242cf535337a490b0feaea0b4" FOREIGN KEY ("messagesId") REFERENCES "messages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT "FK_29d63eb1a458200851bc37d074b" FOREIGN KEY ("rolesId") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
                PRIMARY KEY ("messagesId", "rolesId")
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_message_role_mentions"("messagesId", "rolesId")
            SELECT "messagesId",
                "rolesId"
            FROM "message_role_mentions"
        `);
        await queryRunner.query(`
            DROP TABLE "message_role_mentions"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_message_role_mentions"
                RENAME TO "message_role_mentions"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a8242cf535337a490b0feaea0b" ON "message_role_mentions" ("messagesId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_29d63eb1a458200851bc37d074" ON "message_role_mentions" ("rolesId")
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_2a27102ecd1d81b4582a436092"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_bdb8c09e1464cabf62105bf4b9"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_message_channel_mentions" (
                "messagesId" varchar NOT NULL,
                "channelsId" varchar NOT NULL,
                CONSTRAINT "FK_2a27102ecd1d81b4582a4360921" FOREIGN KEY ("messagesId") REFERENCES "messages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT "FK_bdb8c09e1464cabf62105bf4b9d" FOREIGN KEY ("channelsId") REFERENCES "channels" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
                PRIMARY KEY ("messagesId", "channelsId")
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_message_channel_mentions"("messagesId", "channelsId")
            SELECT "messagesId",
                "channelsId"
            FROM "message_channel_mentions"
        `);
        await queryRunner.query(`
            DROP TABLE "message_channel_mentions"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_message_channel_mentions"
                RENAME TO "message_channel_mentions"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_2a27102ecd1d81b4582a436092" ON "message_channel_mentions" ("messagesId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_bdb8c09e1464cabf62105bf4b9" ON "message_channel_mentions" ("channelsId")
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_40bb6f23e7cc133292e92829d2"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_e22a70819d07659c7a71c112a1"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_message_stickers" (
                "messagesId" varchar NOT NULL,
                "stickersId" varchar NOT NULL,
                CONSTRAINT "FK_40bb6f23e7cc133292e92829d28" FOREIGN KEY ("messagesId") REFERENCES "messages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT "FK_e22a70819d07659c7a71c112a1f" FOREIGN KEY ("stickersId") REFERENCES "stickers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
                PRIMARY KEY ("messagesId", "stickersId")
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_message_stickers"("messagesId", "stickersId")
            SELECT "messagesId",
                "stickersId"
            FROM "message_stickers"
        `);
        await queryRunner.query(`
            DROP TABLE "message_stickers"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_message_stickers"
                RENAME TO "message_stickers"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_40bb6f23e7cc133292e92829d2" ON "message_stickers" ("messagesId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e22a70819d07659c7a71c112a1" ON "message_stickers" ("stickersId")
        `);
        await queryRunner.query(`
            CREATE TABLE "query-result-cache" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "identifier" varchar,
                "time" bigint NOT NULL,
                "duration" integer NOT NULL,
                "query" text NOT NULL,
                "result" text NOT NULL
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "query-result-cache"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_e22a70819d07659c7a71c112a1"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_40bb6f23e7cc133292e92829d2"
        `);
        await queryRunner.query(`
            ALTER TABLE "message_stickers"
                RENAME TO "temporary_message_stickers"
        `);
        await queryRunner.query(`
            CREATE TABLE "message_stickers" (
                "messagesId" varchar NOT NULL,
                "stickersId" varchar NOT NULL,
                PRIMARY KEY ("messagesId", "stickersId")
            )
        `);
        await queryRunner.query(`
            INSERT INTO "message_stickers"("messagesId", "stickersId")
            SELECT "messagesId",
                "stickersId"
            FROM "temporary_message_stickers"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_message_stickers"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e22a70819d07659c7a71c112a1" ON "message_stickers" ("stickersId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_40bb6f23e7cc133292e92829d2" ON "message_stickers" ("messagesId")
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_bdb8c09e1464cabf62105bf4b9"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_2a27102ecd1d81b4582a436092"
        `);
        await queryRunner.query(`
            ALTER TABLE "message_channel_mentions"
                RENAME TO "temporary_message_channel_mentions"
        `);
        await queryRunner.query(`
            CREATE TABLE "message_channel_mentions" (
                "messagesId" varchar NOT NULL,
                "channelsId" varchar NOT NULL,
                PRIMARY KEY ("messagesId", "channelsId")
            )
        `);
        await queryRunner.query(`
            INSERT INTO "message_channel_mentions"("messagesId", "channelsId")
            SELECT "messagesId",
                "channelsId"
            FROM "temporary_message_channel_mentions"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_message_channel_mentions"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_bdb8c09e1464cabf62105bf4b9" ON "message_channel_mentions" ("channelsId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_2a27102ecd1d81b4582a436092" ON "message_channel_mentions" ("messagesId")
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_29d63eb1a458200851bc37d074"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_a8242cf535337a490b0feaea0b"
        `);
        await queryRunner.query(`
            ALTER TABLE "message_role_mentions"
                RENAME TO "temporary_message_role_mentions"
        `);
        await queryRunner.query(`
            CREATE TABLE "message_role_mentions" (
                "messagesId" varchar NOT NULL,
                "rolesId" varchar NOT NULL,
                PRIMARY KEY ("messagesId", "rolesId")
            )
        `);
        await queryRunner.query(`
            INSERT INTO "message_role_mentions"("messagesId", "rolesId")
            SELECT "messagesId",
                "rolesId"
            FROM "temporary_message_role_mentions"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_message_role_mentions"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_29d63eb1a458200851bc37d074" ON "message_role_mentions" ("rolesId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a8242cf535337a490b0feaea0b" ON "message_role_mentions" ("messagesId")
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_b831eb18ceebd28976239b1e2f"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_a343387fc560ef378760681c23"
        `);
        await queryRunner.query(`
            ALTER TABLE "message_user_mentions"
                RENAME TO "temporary_message_user_mentions"
        `);
        await queryRunner.query(`
            CREATE TABLE "message_user_mentions" (
                "messagesId" varchar NOT NULL,
                "usersId" varchar NOT NULL,
                PRIMARY KEY ("messagesId", "usersId")
            )
        `);
        await queryRunner.query(`
            INSERT INTO "message_user_mentions"("messagesId", "usersId")
            SELECT "messagesId",
                "usersId"
            FROM "temporary_message_user_mentions"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_message_user_mentions"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b831eb18ceebd28976239b1e2f" ON "message_user_mentions" ("usersId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a343387fc560ef378760681c23" ON "message_user_mentions" ("messagesId")
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_e9080e7a7997a0170026d5139c"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_5d7ddc8a5f9c167f548625e772"
        `);
        await queryRunner.query(`
            ALTER TABLE "member_roles"
                RENAME TO "temporary_member_roles"
        `);
        await queryRunner.query(`
            CREATE TABLE "member_roles" (
                "index" integer NOT NULL,
                "role_id" varchar NOT NULL,
                PRIMARY KEY ("index", "role_id")
            )
        `);
        await queryRunner.query(`
            INSERT INTO "member_roles"("index", "role_id")
            SELECT "index",
                "role_id"
            FROM "temporary_member_roles"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_member_roles"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e9080e7a7997a0170026d5139c" ON "member_roles" ("role_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_5d7ddc8a5f9c167f548625e772" ON "member_roles" ("index")
        `);
        await queryRunner.query(`
            ALTER TABLE "notes"
                RENAME TO "temporary_notes"
        `);
        await queryRunner.query(`
            CREATE TABLE "notes" (
                "id" varchar PRIMARY KEY NOT NULL,
                "content" varchar NOT NULL,
                "owner_id" varchar,
                "target_id" varchar,
                CONSTRAINT "UQ_74e6689b9568cc965b8bfc9150b" UNIQUE ("owner_id", "target_id")
            )
        `);
        await queryRunner.query(`
            INSERT INTO "notes"("id", "content", "owner_id", "target_id")
            SELECT "id",
                "content",
                "owner_id",
                "target_id"
            FROM "temporary_notes"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_notes"
        `);
        await queryRunner.query(`
            ALTER TABLE "sticker_packs"
                RENAME TO "temporary_sticker_packs"
        `);
        await queryRunner.query(`
            CREATE TABLE "sticker_packs" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "description" varchar,
                "banner_asset_id" varchar,
                "cover_sticker_id" varchar,
                "coverStickerId" varchar
            )
        `);
        await queryRunner.query(`
            INSERT INTO "sticker_packs"(
                    "id",
                    "name",
                    "description",
                    "banner_asset_id",
                    "cover_sticker_id",
                    "coverStickerId"
                )
            SELECT "id",
                "name",
                "description",
                "banner_asset_id",
                "cover_sticker_id",
                "coverStickerId"
            FROM "temporary_sticker_packs"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_sticker_packs"
        `);
        await queryRunner.query(`
            ALTER TABLE "sessions"
                RENAME TO "temporary_sessions"
        `);
        await queryRunner.query(`
            CREATE TABLE "sessions" (
                "id" varchar PRIMARY KEY NOT NULL,
                "user_id" varchar,
                "session_id" varchar NOT NULL,
                "activities" text,
                "client_info" text NOT NULL,
                "status" varchar NOT NULL
            )
        `);
        await queryRunner.query(`
            INSERT INTO "sessions"(
                    "id",
                    "user_id",
                    "session_id",
                    "activities",
                    "client_info",
                    "status"
                )
            SELECT "id",
                "user_id",
                "session_id",
                "activities",
                "client_info",
                "status"
            FROM "temporary_sessions"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_sessions"
        `);
        await queryRunner.query(`
            ALTER TABLE "audit_logs"
                RENAME TO "temporary_audit_logs"
        `);
        await queryRunner.query(`
            CREATE TABLE "audit_logs" (
                "id" varchar PRIMARY KEY NOT NULL,
                "user_id" varchar,
                "action_type" integer NOT NULL,
                "options" text,
                "changes" text NOT NULL,
                "reason" varchar,
                "target_id" varchar
            )
        `);
        await queryRunner.query(`
            INSERT INTO "audit_logs"(
                    "id",
                    "user_id",
                    "action_type",
                    "options",
                    "changes",
                    "reason",
                    "target_id"
                )
            SELECT "id",
                "user_id",
                "action_type",
                "options",
                "changes",
                "reason",
                "target_id"
            FROM "temporary_audit_logs"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_audit_logs"
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
                "guild_id" varchar
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
        await queryRunner.query(`
            ALTER TABLE "teams"
                RENAME TO "temporary_teams"
        `);
        await queryRunner.query(`
            CREATE TABLE "teams" (
                "id" varchar PRIMARY KEY NOT NULL,
                "icon" varchar,
                "name" varchar NOT NULL,
                "owner_user_id" varchar
            )
        `);
        await queryRunner.query(`
            INSERT INTO "teams"("id", "icon", "name", "owner_user_id")
            SELECT "id",
                "icon",
                "name",
                "owner_user_id"
            FROM "temporary_teams"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_teams"
        `);
        await queryRunner.query(`
            ALTER TABLE "team_members"
                RENAME TO "temporary_team_members"
        `);
        await queryRunner.query(`
            CREATE TABLE "team_members" (
                "id" varchar PRIMARY KEY NOT NULL,
                "membership_state" integer NOT NULL,
                "permissions" text NOT NULL,
                "team_id" varchar,
                "user_id" varchar
            )
        `);
        await queryRunner.query(`
            INSERT INTO "team_members"(
                    "id",
                    "membership_state",
                    "permissions",
                    "team_id",
                    "user_id"
                )
            SELECT "id",
                "membership_state",
                "permissions",
                "team_id",
                "user_id"
            FROM "temporary_team_members"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_team_members"
        `);
        await queryRunner.query(`
            ALTER TABLE "guilds"
                RENAME TO "temporary_guilds"
        `);
        await queryRunner.query(`
            CREATE TABLE "guilds" (
                "id" varchar PRIMARY KEY NOT NULL,
                "afk_channel_id" varchar,
                "afk_timeout" integer,
                "banner" varchar,
                "default_message_notifications" integer,
                "description" varchar,
                "discovery_splash" varchar,
                "explicit_content_filter" integer,
                "features" text NOT NULL,
                "primary_category_id" integer,
                "icon" varchar,
                "large" boolean,
                "max_members" integer,
                "max_presences" integer,
                "max_video_channel_users" integer,
                "member_count" integer,
                "presence_count" integer,
                "template_id" varchar,
                "mfa_level" integer,
                "name" varchar NOT NULL,
                "owner_id" varchar,
                "preferred_locale" varchar,
                "premium_subscription_count" integer,
                "premium_tier" integer,
                "public_updates_channel_id" varchar,
                "rules_channel_id" varchar,
                "region" varchar,
                "splash" varchar,
                "system_channel_id" varchar,
                "system_channel_flags" integer,
                "unavailable" boolean,
                "verification_level" integer,
                "welcome_screen" text NOT NULL,
                "widget_channel_id" varchar,
                "widget_enabled" boolean,
                "nsfw_level" integer,
                "nsfw" boolean,
                "parent" varchar
            )
        `);
        await queryRunner.query(`
            INSERT INTO "guilds"(
                    "id",
                    "afk_channel_id",
                    "afk_timeout",
                    "banner",
                    "default_message_notifications",
                    "description",
                    "discovery_splash",
                    "explicit_content_filter",
                    "features",
                    "primary_category_id",
                    "icon",
                    "large",
                    "max_members",
                    "max_presences",
                    "max_video_channel_users",
                    "member_count",
                    "presence_count",
                    "template_id",
                    "mfa_level",
                    "name",
                    "owner_id",
                    "preferred_locale",
                    "premium_subscription_count",
                    "premium_tier",
                    "public_updates_channel_id",
                    "rules_channel_id",
                    "region",
                    "splash",
                    "system_channel_id",
                    "system_channel_flags",
                    "unavailable",
                    "verification_level",
                    "welcome_screen",
                    "widget_channel_id",
                    "widget_enabled",
                    "nsfw_level",
                    "nsfw",
                    "parent"
                )
            SELECT "id",
                "afk_channel_id",
                "afk_timeout",
                "banner",
                "default_message_notifications",
                "description",
                "discovery_splash",
                "explicit_content_filter",
                "features",
                "primary_category_id",
                "icon",
                "large",
                "max_members",
                "max_presences",
                "max_video_channel_users",
                "member_count",
                "presence_count",
                "template_id",
                "mfa_level",
                "name",
                "owner_id",
                "preferred_locale",
                "premium_subscription_count",
                "premium_tier",
                "public_updates_channel_id",
                "rules_channel_id",
                "region",
                "splash",
                "system_channel_id",
                "system_channel_flags",
                "unavailable",
                "verification_level",
                "welcome_screen",
                "widget_channel_id",
                "widget_enabled",
                "nsfw_level",
                "nsfw",
                "parent"
            FROM "temporary_guilds"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_guilds"
        `);
        await queryRunner.query(`
            ALTER TABLE "templates"
                RENAME TO "temporary_templates"
        `);
        await queryRunner.query(`
            CREATE TABLE "templates" (
                "id" varchar PRIMARY KEY NOT NULL,
                "code" varchar NOT NULL,
                "name" varchar NOT NULL,
                "description" varchar,
                "usage_count" integer,
                "creator_id" varchar,
                "created_at" datetime NOT NULL,
                "updated_at" datetime NOT NULL,
                "source_guild_id" varchar,
                "serialized_source_guild" text NOT NULL,
                CONSTRAINT "UQ_be38737bf339baf63b1daeffb55" UNIQUE ("code")
            )
        `);
        await queryRunner.query(`
            INSERT INTO "templates"(
                    "id",
                    "code",
                    "name",
                    "description",
                    "usage_count",
                    "creator_id",
                    "created_at",
                    "updated_at",
                    "source_guild_id",
                    "serialized_source_guild"
                )
            SELECT "id",
                "code",
                "name",
                "description",
                "usage_count",
                "creator_id",
                "created_at",
                "updated_at",
                "source_guild_id",
                "serialized_source_guild"
            FROM "temporary_templates"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_templates"
        `);
        await queryRunner.query(`
            ALTER TABLE "emojis"
                RENAME TO "temporary_emojis"
        `);
        await queryRunner.query(`
            CREATE TABLE "emojis" (
                "id" varchar PRIMARY KEY NOT NULL,
                "animated" boolean NOT NULL,
                "available" boolean NOT NULL,
                "guild_id" varchar NOT NULL,
                "user_id" varchar,
                "managed" boolean NOT NULL,
                "name" varchar NOT NULL,
                "require_colons" boolean NOT NULL,
                "roles" text NOT NULL,
                "groups" text
            )
        `);
        await queryRunner.query(`
            INSERT INTO "emojis"(
                    "id",
                    "animated",
                    "available",
                    "guild_id",
                    "user_id",
                    "managed",
                    "name",
                    "require_colons",
                    "roles",
                    "groups"
                )
            SELECT "id",
                "animated",
                "available",
                "guild_id",
                "user_id",
                "managed",
                "name",
                "require_colons",
                "roles",
                "groups"
            FROM "temporary_emojis"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_emojis"
        `);
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
                "retention_policy_id" varchar
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
                    "retention_policy_id"
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
                "retention_policy_id"
            FROM "temporary_channels"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_channels"
        `);
        await queryRunner.query(`
            ALTER TABLE "voice_states"
                RENAME TO "temporary_voice_states"
        `);
        await queryRunner.query(`
            CREATE TABLE "voice_states" (
                "id" varchar PRIMARY KEY NOT NULL,
                "guild_id" varchar,
                "channel_id" varchar,
                "user_id" varchar,
                "session_id" varchar NOT NULL,
                "token" varchar,
                "deaf" boolean NOT NULL,
                "mute" boolean NOT NULL,
                "self_deaf" boolean NOT NULL,
                "self_mute" boolean NOT NULL,
                "self_stream" boolean,
                "self_video" boolean NOT NULL,
                "suppress" boolean NOT NULL,
                "request_to_speak_timestamp" datetime
            )
        `);
        await queryRunner.query(`
            INSERT INTO "voice_states"(
                    "id",
                    "guild_id",
                    "channel_id",
                    "user_id",
                    "session_id",
                    "token",
                    "deaf",
                    "mute",
                    "self_deaf",
                    "self_mute",
                    "self_stream",
                    "self_video",
                    "suppress",
                    "request_to_speak_timestamp"
                )
            SELECT "id",
                "guild_id",
                "channel_id",
                "user_id",
                "session_id",
                "token",
                "deaf",
                "mute",
                "self_deaf",
                "self_mute",
                "self_stream",
                "self_video",
                "suppress",
                "request_to_speak_timestamp"
            FROM "temporary_voice_states"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_voice_states"
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
                "vanity_url" boolean
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
            DROP INDEX "IDX_0abf8b443321bd3cf7f81ee17a"
        `);
        await queryRunner.query(`
            ALTER TABLE "read_states"
                RENAME TO "temporary_read_states"
        `);
        await queryRunner.query(`
            CREATE TABLE "read_states" (
                "id" varchar PRIMARY KEY NOT NULL,
                "channel_id" varchar NOT NULL,
                "user_id" varchar NOT NULL,
                "last_message_id" varchar,
                "public_ack" varchar,
                "notifications_cursor" varchar,
                "last_pin_timestamp" datetime,
                "mention_count" integer
            )
        `);
        await queryRunner.query(`
            INSERT INTO "read_states"(
                    "id",
                    "channel_id",
                    "user_id",
                    "last_message_id",
                    "public_ack",
                    "notifications_cursor",
                    "last_pin_timestamp",
                    "mention_count"
                )
            SELECT "id",
                "channel_id",
                "user_id",
                "last_message_id",
                "public_ack",
                "notifications_cursor",
                "last_pin_timestamp",
                "mention_count"
            FROM "temporary_read_states"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_read_states"
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_0abf8b443321bd3cf7f81ee17a" ON "read_states" ("channel_id", "user_id")
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_3ed7a60fb7dbe04e1ba9332a8b"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_05535bc695e9f7ee104616459d"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_86b9109b155eb70c0a2ca3b4b6"
        `);
        await queryRunner.query(`
            ALTER TABLE "messages"
                RENAME TO "temporary_messages"
        `);
        await queryRunner.query(`
            CREATE TABLE "messages" (
                "id" varchar PRIMARY KEY NOT NULL,
                "channel_id" varchar,
                "guild_id" varchar,
                "author_id" varchar,
                "member_id" varchar,
                "webhook_id" varchar,
                "application_id" varchar,
                "content" varchar,
                "timestamp" datetime NOT NULL DEFAULT (datetime('now')),
                "edited_timestamp" datetime,
                "tts" boolean,
                "mention_everyone" boolean,
                "embeds" text NOT NULL,
                "reactions" text NOT NULL,
                "nonce" text,
                "pinned" boolean,
                "type" integer NOT NULL,
                "activity" text,
                "flags" varchar,
                "message_reference" text,
                "interaction" text,
                "components" text,
                "message_reference_id" varchar
            )
        `);
        await queryRunner.query(`
            INSERT INTO "messages"(
                    "id",
                    "channel_id",
                    "guild_id",
                    "author_id",
                    "member_id",
                    "webhook_id",
                    "application_id",
                    "content",
                    "timestamp",
                    "edited_timestamp",
                    "tts",
                    "mention_everyone",
                    "embeds",
                    "reactions",
                    "nonce",
                    "pinned",
                    "type",
                    "activity",
                    "flags",
                    "message_reference",
                    "interaction",
                    "components",
                    "message_reference_id"
                )
            SELECT "id",
                "channel_id",
                "guild_id",
                "author_id",
                "member_id",
                "webhook_id",
                "application_id",
                "content",
                "timestamp",
                "edited_timestamp",
                "tts",
                "mention_everyone",
                "embeds",
                "reactions",
                "nonce",
                "pinned",
                "type",
                "activity",
                "flags",
                "message_reference",
                "interaction",
                "components",
                "message_reference_id"
            FROM "temporary_messages"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_messages"
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_3ed7a60fb7dbe04e1ba9332a8b" ON "messages" ("channel_id", "id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_05535bc695e9f7ee104616459d" ON "messages" ("author_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_86b9109b155eb70c0a2ca3b4b6" ON "messages" ("channel_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "attachments"
                RENAME TO "temporary_attachments"
        `);
        await queryRunner.query(`
            CREATE TABLE "attachments" (
                "id" varchar PRIMARY KEY NOT NULL,
                "filename" varchar NOT NULL,
                "size" integer NOT NULL,
                "url" varchar NOT NULL,
                "proxy_url" varchar NOT NULL,
                "height" integer,
                "width" integer,
                "content_type" varchar,
                "message_id" varchar
            )
        `);
        await queryRunner.query(`
            INSERT INTO "attachments"(
                    "id",
                    "filename",
                    "size",
                    "url",
                    "proxy_url",
                    "height",
                    "width",
                    "content_type",
                    "message_id"
                )
            SELECT "id",
                "filename",
                "size",
                "url",
                "proxy_url",
                "height",
                "width",
                "content_type",
                "message_id"
            FROM "temporary_attachments"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_attachments"
        `);
        await queryRunner.query(`
            ALTER TABLE "stickers"
                RENAME TO "temporary_stickers"
        `);
        await queryRunner.query(`
            CREATE TABLE "stickers" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "description" varchar,
                "available" boolean,
                "tags" varchar,
                "pack_id" varchar,
                "guild_id" varchar,
                "user_id" varchar,
                "type" integer NOT NULL,
                "format_type" integer NOT NULL
            )
        `);
        await queryRunner.query(`
            INSERT INTO "stickers"(
                    "id",
                    "name",
                    "description",
                    "available",
                    "tags",
                    "pack_id",
                    "guild_id",
                    "user_id",
                    "type",
                    "format_type"
                )
            SELECT "id",
                "name",
                "description",
                "available",
                "tags",
                "pack_id",
                "guild_id",
                "user_id",
                "type",
                "format_type"
            FROM "temporary_stickers"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_stickers"
        `);
        await queryRunner.query(`
            ALTER TABLE "webhooks"
                RENAME TO "temporary_webhooks"
        `);
        await queryRunner.query(`
            CREATE TABLE "webhooks" (
                "id" varchar PRIMARY KEY NOT NULL,
                "type" integer NOT NULL,
                "name" varchar,
                "avatar" varchar,
                "token" varchar,
                "guild_id" varchar,
                "channel_id" varchar,
                "application_id" varchar,
                "user_id" varchar,
                "source_guild_id" varchar
            )
        `);
        await queryRunner.query(`
            INSERT INTO "webhooks"(
                    "id",
                    "type",
                    "name",
                    "avatar",
                    "token",
                    "guild_id",
                    "channel_id",
                    "application_id",
                    "user_id",
                    "source_guild_id"
                )
            SELECT "id",
                "type",
                "name",
                "avatar",
                "token",
                "guild_id",
                "channel_id",
                "application_id",
                "user_id",
                "source_guild_id"
            FROM "temporary_webhooks"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_webhooks"
        `);
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
                "premium_since" bigint,
                "deaf" boolean NOT NULL,
                "mute" boolean NOT NULL,
                "pending" boolean NOT NULL,
                "settings" text NOT NULL,
                "last_message_id" varchar,
                "joined_by" varchar
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
        await queryRunner.query(`
            ALTER TABLE "roles"
                RENAME TO "temporary_roles"
        `);
        await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" varchar PRIMARY KEY NOT NULL,
                "guild_id" varchar,
                "color" integer NOT NULL,
                "hoist" boolean NOT NULL,
                "managed" boolean NOT NULL,
                "mentionable" boolean NOT NULL,
                "name" varchar NOT NULL,
                "permissions" varchar NOT NULL,
                "position" integer NOT NULL,
                "icon" varchar,
                "unicode_emoji" varchar,
                "tags" text
            )
        `);
        await queryRunner.query(`
            INSERT INTO "roles"(
                    "id",
                    "guild_id",
                    "color",
                    "hoist",
                    "managed",
                    "mentionable",
                    "name",
                    "permissions",
                    "position",
                    "icon",
                    "unicode_emoji",
                    "tags"
                )
            SELECT "id",
                "guild_id",
                "color",
                "hoist",
                "managed",
                "mentionable",
                "name",
                "permissions",
                "position",
                "icon",
                "unicode_emoji",
                "tags"
            FROM "temporary_roles"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_roles"
        `);
        await queryRunner.query(`
            ALTER TABLE "recipients"
                RENAME TO "temporary_recipients"
        `);
        await queryRunner.query(`
            CREATE TABLE "recipients" (
                "id" varchar PRIMARY KEY NOT NULL,
                "channel_id" varchar NOT NULL,
                "user_id" varchar NOT NULL,
                "closed" boolean NOT NULL DEFAULT (0)
            )
        `);
        await queryRunner.query(`
            INSERT INTO "recipients"("id", "channel_id", "user_id", "closed")
            SELECT "id",
                "channel_id",
                "user_id",
                "closed"
            FROM "temporary_recipients"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_recipients"
        `);
        await queryRunner.query(`
            ALTER TABLE "bans"
                RENAME TO "temporary_bans"
        `);
        await queryRunner.query(`
            CREATE TABLE "bans" (
                "id" varchar PRIMARY KEY NOT NULL,
                "user_id" varchar,
                "guild_id" varchar,
                "executor_id" varchar,
                "ip" varchar NOT NULL,
                "reason" varchar
            )
        `);
        await queryRunner.query(`
            INSERT INTO "bans"(
                    "id",
                    "user_id",
                    "guild_id",
                    "executor_id",
                    "ip",
                    "reason"
                )
            SELECT "id",
                "user_id",
                "guild_id",
                "executor_id",
                "ip",
                "reason"
            FROM "temporary_bans"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_bans"
        `);
        await queryRunner.query(`
            ALTER TABLE "backup_codes"
                RENAME TO "temporary_backup_codes"
        `);
        await queryRunner.query(`
            CREATE TABLE "backup_codes" (
                "id" varchar PRIMARY KEY NOT NULL,
                "code" varchar NOT NULL,
                "consumed" boolean NOT NULL,
                "expired" boolean NOT NULL,
                "user_id" varchar
            )
        `);
        await queryRunner.query(`
            INSERT INTO "backup_codes"("id", "code", "consumed", "expired", "user_id")
            SELECT "id",
                "code",
                "consumed",
                "expired",
                "user_id"
            FROM "temporary_backup_codes"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_backup_codes"
        `);
        await queryRunner.query(`
            ALTER TABLE "connected_accounts"
                RENAME TO "temporary_connected_accounts"
        `);
        await queryRunner.query(`
            CREATE TABLE "connected_accounts" (
                "id" varchar PRIMARY KEY NOT NULL,
                "user_id" varchar,
                "access_token" varchar NOT NULL,
                "friend_sync" boolean NOT NULL,
                "name" varchar NOT NULL,
                "revoked" boolean NOT NULL,
                "show_activity" boolean NOT NULL,
                "type" varchar NOT NULL,
                "verified" boolean NOT NULL,
                "visibility" integer NOT NULL
            )
        `);
        await queryRunner.query(`
            INSERT INTO "connected_accounts"(
                    "id",
                    "user_id",
                    "access_token",
                    "friend_sync",
                    "name",
                    "revoked",
                    "show_activity",
                    "type",
                    "verified",
                    "visibility"
                )
            SELECT "id",
                "user_id",
                "access_token",
                "friend_sync",
                "name",
                "revoked",
                "show_activity",
                "type",
                "verified",
                "visibility"
            FROM "temporary_connected_accounts"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_connected_accounts"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_a0b2ff0a598df0b0d055934a17"
        `);
        await queryRunner.query(`
            ALTER TABLE "relationships"
                RENAME TO "temporary_relationships"
        `);
        await queryRunner.query(`
            CREATE TABLE "relationships" (
                "id" varchar PRIMARY KEY NOT NULL,
                "from_id" varchar NOT NULL,
                "to_id" varchar NOT NULL,
                "nickname" varchar,
                "type" integer NOT NULL
            )
        `);
        await queryRunner.query(`
            INSERT INTO "relationships"("id", "from_id", "to_id", "nickname", "type")
            SELECT "id",
                "from_id",
                "to_id",
                "nickname",
                "type"
            FROM "temporary_relationships"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_relationships"
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_a0b2ff0a598df0b0d055934a17" ON "relationships" ("from_id", "to_id")
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_e22a70819d07659c7a71c112a1"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_40bb6f23e7cc133292e92829d2"
        `);
        await queryRunner.query(`
            DROP TABLE "message_stickers"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_bdb8c09e1464cabf62105bf4b9"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_2a27102ecd1d81b4582a436092"
        `);
        await queryRunner.query(`
            DROP TABLE "message_channel_mentions"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_29d63eb1a458200851bc37d074"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_a8242cf535337a490b0feaea0b"
        `);
        await queryRunner.query(`
            DROP TABLE "message_role_mentions"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_b831eb18ceebd28976239b1e2f"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_a343387fc560ef378760681c23"
        `);
        await queryRunner.query(`
            DROP TABLE "message_user_mentions"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_e9080e7a7997a0170026d5139c"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_5d7ddc8a5f9c167f548625e772"
        `);
        await queryRunner.query(`
            DROP TABLE "member_roles"
        `);
        await queryRunner.query(`
            DROP TABLE "notes"
        `);
        await queryRunner.query(`
            DROP TABLE "client_release"
        `);
        await queryRunner.query(`
            DROP TABLE "sticker_packs"
        `);
        await queryRunner.query(`
            DROP TABLE "sessions"
        `);
        await queryRunner.query(`
            DROP TABLE "rate_limits"
        `);
        await queryRunner.query(`
            DROP TABLE "categories"
        `);
        await queryRunner.query(`
            DROP TABLE "audit_logs"
        `);
        await queryRunner.query(`
            DROP TABLE "applications"
        `);
        await queryRunner.query(`
            DROP TABLE "teams"
        `);
        await queryRunner.query(`
            DROP TABLE "team_members"
        `);
        await queryRunner.query(`
            DROP TABLE "guilds"
        `);
        await queryRunner.query(`
            DROP TABLE "templates"
        `);
        await queryRunner.query(`
            DROP TABLE "emojis"
        `);
        await queryRunner.query(`
            DROP TABLE "channels"
        `);
        await queryRunner.query(`
            DROP TABLE "voice_states"
        `);
        await queryRunner.query(`
            DROP TABLE "invites"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_0abf8b443321bd3cf7f81ee17a"
        `);
        await queryRunner.query(`
            DROP TABLE "read_states"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_3ed7a60fb7dbe04e1ba9332a8b"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_05535bc695e9f7ee104616459d"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_86b9109b155eb70c0a2ca3b4b6"
        `);
        await queryRunner.query(`
            DROP TABLE "messages"
        `);
        await queryRunner.query(`
            DROP TABLE "attachments"
        `);
        await queryRunner.query(`
            DROP TABLE "stickers"
        `);
        await queryRunner.query(`
            DROP TABLE "webhooks"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_bb2bf9386ac443afbbbf9f12d3"
        `);
        await queryRunner.query(`
            DROP TABLE "members"
        `);
        await queryRunner.query(`
            DROP TABLE "roles"
        `);
        await queryRunner.query(`
            DROP TABLE "recipients"
        `);
        await queryRunner.query(`
            DROP TABLE "bans"
        `);
        await queryRunner.query(`
            DROP TABLE "backup_codes"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP TABLE "connected_accounts"
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_a0b2ff0a598df0b0d055934a17"
        `);
        await queryRunner.query(`
            DROP TABLE "relationships"
        `);
        await queryRunner.query(`
            DROP TABLE "config"
        `);
    }

}
