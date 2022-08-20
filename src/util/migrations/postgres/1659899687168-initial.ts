import { MigrationInterface, QueryRunner } from "typeorm";

export class initial1659899687168 implements MigrationInterface {
	name = "initial1659899687168";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            CREATE TABLE "config" (
                "key" character varying NOT NULL,
                "value" text,
                CONSTRAINT "PK_26489c99ddbb4c91631ef5cc791" PRIMARY KEY ("key")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "relationships" (
                "id" character varying NOT NULL,
                "from_id" character varying NOT NULL,
                "to_id" character varying NOT NULL,
                "nickname" character varying,
                "type" integer NOT NULL,
                CONSTRAINT "PK_ba20e2f5cf487408e08e4dcecaf" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_a0b2ff0a598df0b0d055934a17" ON "relationships" ("from_id", "to_id")
        `);
		await queryRunner.query(`
            CREATE TABLE "connected_accounts" (
                "id" character varying NOT NULL,
                "user_id" character varying,
                "access_token" character varying NOT NULL,
                "friend_sync" boolean NOT NULL,
                "name" character varying NOT NULL,
                "revoked" boolean NOT NULL,
                "show_activity" boolean NOT NULL,
                "type" character varying NOT NULL,
                "verified" boolean NOT NULL,
                "visibility" integer NOT NULL,
                CONSTRAINT "PK_70416f1da0be645bb31da01c774" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "users" (
                "id" character varying NOT NULL,
                "username" character varying NOT NULL,
                "discriminator" character varying NOT NULL,
                "avatar" character varying,
                "accent_color" integer,
                "banner" character varying,
                "phone" character varying,
                "desktop" boolean NOT NULL,
                "mobile" boolean NOT NULL,
                "premium" boolean NOT NULL,
                "premium_type" integer NOT NULL,
                "bot" boolean NOT NULL,
                "bio" character varying NOT NULL,
                "system" boolean NOT NULL,
                "nsfw_allowed" boolean NOT NULL,
                "mfa_enabled" boolean NOT NULL,
                "totp_secret" character varying,
                "totp_last_ticket" character varying,
                "created_at" TIMESTAMP NOT NULL,
                "premium_since" TIMESTAMP,
                "verified" boolean NOT NULL,
                "disabled" boolean NOT NULL,
                "deleted" boolean NOT NULL,
                "email" character varying,
                "flags" character varying NOT NULL,
                "public_flags" integer NOT NULL,
                "rights" bigint NOT NULL,
                "data" text NOT NULL,
                "fingerprints" text NOT NULL,
                "settings" text NOT NULL,
                "extended_settings" text NOT NULL,
                "notes" text NOT NULL,
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "backup_codes" (
                "id" character varying NOT NULL,
                "code" character varying NOT NULL,
                "consumed" boolean NOT NULL,
                "expired" boolean NOT NULL,
                "user_id" character varying,
                CONSTRAINT "PK_34ab957382dbc57e8fb53f1638f" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "bans" (
                "id" character varying NOT NULL,
                "user_id" character varying,
                "guild_id" character varying,
                "executor_id" character varying,
                "ip" character varying NOT NULL,
                "reason" character varying,
                CONSTRAINT "PK_a4d6f261bffa4615c62d756566a" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "recipients" (
                "id" character varying NOT NULL,
                "channel_id" character varying NOT NULL,
                "user_id" character varying NOT NULL,
                "closed" boolean NOT NULL DEFAULT false,
                CONSTRAINT "PK_de8fc5a9c364568f294798fe1e9" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" character varying NOT NULL,
                "guild_id" character varying,
                "color" integer NOT NULL,
                "hoist" boolean NOT NULL,
                "managed" boolean NOT NULL,
                "mentionable" boolean NOT NULL,
                "name" character varying NOT NULL,
                "permissions" character varying NOT NULL,
                "position" integer NOT NULL,
                "icon" character varying,
                "unicode_emoji" character varying,
                "tags" text,
                CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "members" (
                "index" SERIAL NOT NULL,
                "id" character varying NOT NULL,
                "guild_id" character varying NOT NULL,
                "nick" character varying,
                "joined_at" TIMESTAMP NOT NULL,
                "premium_since" bigint,
                "deaf" boolean NOT NULL,
                "mute" boolean NOT NULL,
                "pending" boolean NOT NULL,
                "settings" text NOT NULL,
                "last_message_id" character varying,
                "joined_by" character varying,
                CONSTRAINT "PK_b4a6b8c2478e5df990909c6cf6a" PRIMARY KEY ("index")
            )
        `);
		await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_bb2bf9386ac443afbbbf9f12d3" ON "members" ("id", "guild_id")
        `);
		await queryRunner.query(`
            CREATE TABLE "webhooks" (
                "id" character varying NOT NULL,
                "type" integer NOT NULL,
                "name" character varying,
                "avatar" character varying,
                "token" character varying,
                "guild_id" character varying,
                "channel_id" character varying,
                "application_id" character varying,
                "user_id" character varying,
                "source_guild_id" character varying,
                CONSTRAINT "PK_9e8795cfc899ab7bdaa831e8527" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "stickers" (
                "id" character varying NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "available" boolean,
                "tags" character varying,
                "pack_id" character varying,
                "guild_id" character varying,
                "user_id" character varying,
                "type" integer NOT NULL,
                "format_type" integer NOT NULL,
                CONSTRAINT "PK_e1dafa4063a5532645cc2810374" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "attachments" (
                "id" character varying NOT NULL,
                "filename" character varying NOT NULL,
                "size" integer NOT NULL,
                "url" character varying NOT NULL,
                "proxy_url" character varying NOT NULL,
                "height" integer,
                "width" integer,
                "content_type" character varying,
                "message_id" character varying,
                CONSTRAINT "PK_5e1f050bcff31e3084a1d662412" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "messages" (
                "id" character varying NOT NULL,
                "channel_id" character varying,
                "guild_id" character varying,
                "author_id" character varying,
                "member_id" character varying,
                "webhook_id" character varying,
                "application_id" character varying,
                "content" character varying,
                "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
                "edited_timestamp" TIMESTAMP,
                "tts" boolean,
                "mention_everyone" boolean,
                "embeds" text NOT NULL,
                "reactions" text NOT NULL,
                "nonce" text,
                "pinned" boolean,
                "type" integer NOT NULL,
                "activity" text,
                "flags" character varying,
                "message_reference" text,
                "interaction" text,
                "components" text,
                "message_reference_id" character varying,
                CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id")
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
                "id" character varying NOT NULL,
                "channel_id" character varying NOT NULL,
                "user_id" character varying NOT NULL,
                "last_message_id" character varying,
                "public_ack" character varying,
                "notifications_cursor" character varying,
                "last_pin_timestamp" TIMESTAMP,
                "mention_count" integer,
                CONSTRAINT "PK_e6956a804978f01b713b1ed58e2" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_0abf8b443321bd3cf7f81ee17a" ON "read_states" ("channel_id", "user_id")
        `);
		await queryRunner.query(`
            CREATE TABLE "invites" (
                "code" character varying NOT NULL,
                "temporary" boolean NOT NULL,
                "uses" integer NOT NULL,
                "max_uses" integer NOT NULL,
                "max_age" integer NOT NULL,
                "created_at" TIMESTAMP NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                "guild_id" character varying,
                "channel_id" character varying,
                "inviter_id" character varying,
                "target_user_id" character varying,
                "target_user_type" integer,
                "vanity_url" boolean,
                CONSTRAINT "PK_33fd8a248db1cd832baa8aa25bf" PRIMARY KEY ("code")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "voice_states" (
                "id" character varying NOT NULL,
                "guild_id" character varying,
                "channel_id" character varying,
                "user_id" character varying,
                "session_id" character varying NOT NULL,
                "token" character varying,
                "deaf" boolean NOT NULL,
                "mute" boolean NOT NULL,
                "self_deaf" boolean NOT NULL,
                "self_mute" boolean NOT NULL,
                "self_stream" boolean,
                "self_video" boolean NOT NULL,
                "suppress" boolean NOT NULL,
                "request_to_speak_timestamp" TIMESTAMP,
                CONSTRAINT "PK_ada09a50c134fad1369b510e3ce" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "channels" (
                "id" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL,
                "name" character varying,
                "icon" text,
                "type" integer NOT NULL,
                "last_message_id" character varying,
                "guild_id" character varying,
                "parent_id" character varying,
                "owner_id" character varying,
                "last_pin_timestamp" integer,
                "default_auto_archive_duration" integer,
                "position" integer,
                "permission_overwrites" text,
                "video_quality_mode" integer,
                "bitrate" integer,
                "user_limit" integer,
                "nsfw" boolean,
                "rate_limit_per_user" integer,
                "topic" character varying,
                "retention_policy_id" character varying,
                CONSTRAINT "PK_bc603823f3f741359c2339389f9" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "emojis" (
                "id" character varying NOT NULL,
                "animated" boolean NOT NULL,
                "available" boolean NOT NULL,
                "guild_id" character varying NOT NULL,
                "user_id" character varying,
                "managed" boolean NOT NULL,
                "name" character varying NOT NULL,
                "require_colons" boolean NOT NULL,
                "roles" text NOT NULL,
                "groups" text,
                CONSTRAINT "PK_9adb96a675f555c6169bad7ba62" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "templates" (
                "id" character varying NOT NULL,
                "code" character varying NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "usage_count" integer,
                "creator_id" character varying,
                "created_at" TIMESTAMP NOT NULL,
                "updated_at" TIMESTAMP NOT NULL,
                "source_guild_id" character varying,
                "serialized_source_guild" text NOT NULL,
                CONSTRAINT "UQ_be38737bf339baf63b1daeffb55" UNIQUE ("code"),
                CONSTRAINT "PK_515948649ce0bbbe391de702ae5" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "guilds" (
                "id" character varying NOT NULL,
                "afk_channel_id" character varying,
                "afk_timeout" integer,
                "banner" character varying,
                "default_message_notifications" integer,
                "description" character varying,
                "discovery_splash" character varying,
                "explicit_content_filter" integer,
                "features" text NOT NULL,
                "primary_category_id" integer,
                "icon" character varying,
                "large" boolean,
                "max_members" integer,
                "max_presences" integer,
                "max_video_channel_users" integer,
                "member_count" integer,
                "presence_count" integer,
                "template_id" character varying,
                "mfa_level" integer,
                "name" character varying NOT NULL,
                "owner_id" character varying,
                "preferred_locale" character varying,
                "premium_subscription_count" integer,
                "premium_tier" integer,
                "public_updates_channel_id" character varying,
                "rules_channel_id" character varying,
                "region" character varying,
                "splash" character varying,
                "system_channel_id" character varying,
                "system_channel_flags" integer,
                "unavailable" boolean,
                "verification_level" integer,
                "welcome_screen" text NOT NULL,
                "widget_channel_id" character varying,
                "widget_enabled" boolean,
                "nsfw_level" integer,
                "nsfw" boolean,
                "parent" character varying,
                CONSTRAINT "PK_e7e7f2a51bd6d96a9ac2aa560f9" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "team_members" (
                "id" character varying NOT NULL,
                "membership_state" integer NOT NULL,
                "permissions" text NOT NULL,
                "team_id" character varying,
                "user_id" character varying,
                CONSTRAINT "PK_ca3eae89dcf20c9fd95bf7460aa" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "teams" (
                "id" character varying NOT NULL,
                "icon" character varying,
                "name" character varying NOT NULL,
                "owner_user_id" character varying,
                CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "applications" (
                "id" character varying NOT NULL,
                "name" character varying NOT NULL,
                "icon" character varying,
                "description" character varying NOT NULL,
                "rpc_origins" text,
                "bot_public" boolean NOT NULL,
                "bot_require_code_grant" boolean NOT NULL,
                "terms_of_service_url" character varying,
                "privacy_policy_url" character varying,
                "summary" character varying,
                "verify_key" character varying NOT NULL,
                "primary_sku_id" character varying,
                "slug" character varying,
                "cover_image" character varying,
                "flags" character varying NOT NULL,
                "owner_id" character varying,
                "team_id" character varying,
                "guild_id" character varying,
                CONSTRAINT "PK_938c0a27255637bde919591888f" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "audit_logs" (
                "id" character varying NOT NULL,
                "user_id" character varying,
                "action_type" integer NOT NULL,
                "options" text,
                "changes" text NOT NULL,
                "reason" character varying,
                "target_id" character varying,
                CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "categories" (
                "id" integer NOT NULL,
                "name" character varying,
                "localizations" text NOT NULL,
                "is_primary" boolean,
                CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "rate_limits" (
                "id" character varying NOT NULL,
                "executor_id" character varying NOT NULL,
                "hits" integer NOT NULL,
                "blocked" boolean NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                CONSTRAINT "PK_3b4449f1f5fc167d921ee619f65" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "sessions" (
                "id" character varying NOT NULL,
                "user_id" character varying,
                "session_id" character varying NOT NULL,
                "activities" text,
                "client_info" text NOT NULL,
                "status" character varying NOT NULL,
                CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "sticker_packs" (
                "id" character varying NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "banner_asset_id" character varying,
                "cover_sticker_id" character varying,
                "coverStickerId" character varying,
                CONSTRAINT "PK_a27381efea0f876f5d3233af655" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "client_release" (
                "id" character varying NOT NULL,
                "name" character varying NOT NULL,
                "pub_date" character varying NOT NULL,
                "url" character varying NOT NULL,
                "deb_url" character varying NOT NULL,
                "osx_url" character varying NOT NULL,
                "win_url" character varying NOT NULL,
                "notes" character varying,
                CONSTRAINT "PK_4c4ea258342d2d6ba1be0a71a43" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "notes" (
                "id" character varying NOT NULL,
                "content" character varying NOT NULL,
                "owner_id" character varying,
                "target_id" character varying,
                CONSTRAINT "UQ_74e6689b9568cc965b8bfc9150b" UNIQUE ("owner_id", "target_id"),
                CONSTRAINT "PK_af6206538ea96c4e77e9f400c3d" PRIMARY KEY ("id")
            )
        `);
		await queryRunner.query(`
            CREATE TABLE "member_roles" (
                "index" integer NOT NULL,
                "role_id" character varying NOT NULL,
                CONSTRAINT "PK_951c1d72a0fd1da8760b4a1fd66" PRIMARY KEY ("index", "role_id")
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
                "messagesId" character varying NOT NULL,
                "usersId" character varying NOT NULL,
                CONSTRAINT "PK_9b9b6e245ad47a48dbd7605d4fb" PRIMARY KEY ("messagesId", "usersId")
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
                "messagesId" character varying NOT NULL,
                "rolesId" character varying NOT NULL,
                CONSTRAINT "PK_74dba92cc300452a6e14b83ed44" PRIMARY KEY ("messagesId", "rolesId")
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
                "messagesId" character varying NOT NULL,
                "channelsId" character varying NOT NULL,
                CONSTRAINT "PK_85cb45351497cd9d06a79ced65e" PRIMARY KEY ("messagesId", "channelsId")
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
                "messagesId" character varying NOT NULL,
                "stickersId" character varying NOT NULL,
                CONSTRAINT "PK_ed820c4093d0b8cd1d2bcf66087" PRIMARY KEY ("messagesId", "stickersId")
            )
        `);
		await queryRunner.query(`
            CREATE INDEX "IDX_40bb6f23e7cc133292e92829d2" ON "message_stickers" ("messagesId")
        `);
		await queryRunner.query(`
            CREATE INDEX "IDX_e22a70819d07659c7a71c112a1" ON "message_stickers" ("stickersId")
        `);
		await queryRunner.query(`
            ALTER TABLE "relationships"
            ADD CONSTRAINT "FK_9af4194bab1250b1c584ae4f1d7" FOREIGN KEY ("from_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "relationships"
            ADD CONSTRAINT "FK_9c7f6b98a9843b76dce1b0c878b" FOREIGN KEY ("to_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "connected_accounts"
            ADD CONSTRAINT "FK_f47244225a6a1eac04a3463dd90" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "backup_codes"
            ADD CONSTRAINT "FK_70066ea80d2f4b871beda32633b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "bans"
            ADD CONSTRAINT "FK_5999e8e449f80a236ff72023559" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "bans"
            ADD CONSTRAINT "FK_9d3ab7dd180ebdd245cdb66ecad" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "bans"
            ADD CONSTRAINT "FK_07ad88c86d1f290d46748410d58" FOREIGN KEY ("executor_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "recipients"
            ADD CONSTRAINT "FK_2f18ee1ba667f233ae86c0ea60e" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "recipients"
            ADD CONSTRAINT "FK_6157e8b6ba4e6e3089616481fe2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "roles"
            ADD CONSTRAINT "FK_c32c1ab1c4dc7dcb0278c4b1b8b" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "members"
            ADD CONSTRAINT "FK_28b53062261b996d9c99fa12404" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "members"
            ADD CONSTRAINT "FK_16aceddd5b89825b8ed6029ad1c" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "webhooks"
            ADD CONSTRAINT "FK_487a7af59d189f744fe394368fc" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "webhooks"
            ADD CONSTRAINT "FK_df528cf77e82f8032230e7e37d8" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "webhooks"
            ADD CONSTRAINT "FK_c3e5305461931763b56aa905f1c" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "webhooks"
            ADD CONSTRAINT "FK_0d523f6f997c86e052c49b1455f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "webhooks"
            ADD CONSTRAINT "FK_3a285f4f49c40e0706d3018bc9f" FOREIGN KEY ("source_guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "stickers"
            ADD CONSTRAINT "FK_e7cfa5cefa6661b3fb8fda8ce69" FOREIGN KEY ("pack_id") REFERENCES "sticker_packs"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "stickers"
            ADD CONSTRAINT "FK_193d551d852aca5347ef5c9f205" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "stickers"
            ADD CONSTRAINT "FK_8f4ee73f2bb2325ff980502e158" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "attachments"
            ADD CONSTRAINT "FK_623e10eec51ada466c5038979e3" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "messages"
            ADD CONSTRAINT "FK_86b9109b155eb70c0a2ca3b4b6d" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "messages"
            ADD CONSTRAINT "FK_b193588441b085352a4c0109423" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "messages"
            ADD CONSTRAINT "FK_05535bc695e9f7ee104616459d3" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "messages"
            ADD CONSTRAINT "FK_b0525304f2262b7014245351c76" FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "messages"
            ADD CONSTRAINT "FK_f83c04bcf1df4e5c0e7a52ed348" FOREIGN KEY ("webhook_id") REFERENCES "webhooks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "messages"
            ADD CONSTRAINT "FK_5d3ec1cb962de6488637fd779d6" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "messages"
            ADD CONSTRAINT "FK_61a92bb65b302a76d9c1fcd3174" FOREIGN KEY ("message_reference_id") REFERENCES "messages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "read_states"
            ADD CONSTRAINT "FK_40da2fca4e0eaf7a23b5bfc5d34" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "read_states"
            ADD CONSTRAINT "FK_195f92e4dd1254a4e348c043763" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "invites"
            ADD CONSTRAINT "FK_3f4939aa1461e8af57fea3fb05d" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "invites"
            ADD CONSTRAINT "FK_6a15b051fe5050aa00a4b9ff0f6" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "invites"
            ADD CONSTRAINT "FK_15c35422032e0b22b4ada95f48f" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "invites"
            ADD CONSTRAINT "FK_11a0d394f8fc649c19ce5f16b59" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "voice_states"
            ADD CONSTRAINT "FK_03779ef216d4b0358470d9cb748" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "voice_states"
            ADD CONSTRAINT "FK_9f8d389866b40b6657edd026dd4" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "voice_states"
            ADD CONSTRAINT "FK_5fe1d5f931a67e85039c640001b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "channels"
            ADD CONSTRAINT "FK_c253dafe5f3a03ec00cd8fb4581" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "channels"
            ADD CONSTRAINT "FK_3274522d14af40540b1a883fc80" FOREIGN KEY ("parent_id") REFERENCES "channels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "channels"
            ADD CONSTRAINT "FK_3873ed438575cce703ecff4fc7b" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "emojis"
            ADD CONSTRAINT "FK_4b988e0db89d94cebcf07f598cc" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "emojis"
            ADD CONSTRAINT "FK_fa7ddd5f9a214e28ce596548421" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "templates"
            ADD CONSTRAINT "FK_d7374b7f8f5fbfdececa4fb62e1" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "templates"
            ADD CONSTRAINT "FK_445d00eaaea0e60a017a5ed0c11" FOREIGN KEY ("source_guild_id") REFERENCES "guilds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "guilds"
            ADD CONSTRAINT "FK_f591a66b8019d87b0fe6c12dad6" FOREIGN KEY ("afk_channel_id") REFERENCES "channels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "guilds"
            ADD CONSTRAINT "FK_e2a2f873a64a5cf62526de42325" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "guilds"
            ADD CONSTRAINT "FK_fc1a451727e3643ca572a3bb394" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "guilds"
            ADD CONSTRAINT "FK_8d450b016dc8bec35f36729e4b0" FOREIGN KEY ("public_updates_channel_id") REFERENCES "channels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "guilds"
            ADD CONSTRAINT "FK_95828668aa333460582e0ca6396" FOREIGN KEY ("rules_channel_id") REFERENCES "channels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "guilds"
            ADD CONSTRAINT "FK_cfc3d3ad260f8121c95b31a1fce" FOREIGN KEY ("system_channel_id") REFERENCES "channels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "guilds"
            ADD CONSTRAINT "FK_9d1d665379eefde7876a17afa99" FOREIGN KEY ("widget_channel_id") REFERENCES "channels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "team_members"
            ADD CONSTRAINT "FK_fdad7d5768277e60c40e01cdcea" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "team_members"
            ADD CONSTRAINT "FK_c2bf4967c8c2a6b845dadfbf3d4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "teams"
            ADD CONSTRAINT "FK_13f00abf7cb6096c43ecaf8c108" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD CONSTRAINT "FK_e57508958bf92b9d9d25231b5e8" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD CONSTRAINT "FK_a36ed02953077f408d0f3ebc424" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "applications"
            ADD CONSTRAINT "FK_e5bf78cdbbe9ba91062d74c5aba" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "audit_logs"
            ADD CONSTRAINT "FK_3cd01cd3ae7aab010310d96ac8e" FOREIGN KEY ("target_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "audit_logs"
            ADD CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "sessions"
            ADD CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "sticker_packs"
            ADD CONSTRAINT "FK_448fafba4355ee1c837bbc865f1" FOREIGN KEY ("coverStickerId") REFERENCES "stickers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "notes"
            ADD CONSTRAINT "FK_f9e103f8ae67cb1787063597925" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "notes"
            ADD CONSTRAINT "FK_23e08e5b4481711d573e1abecdc" FOREIGN KEY ("target_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
		await queryRunner.query(`
            ALTER TABLE "member_roles"
            ADD CONSTRAINT "FK_5d7ddc8a5f9c167f548625e772e" FOREIGN KEY ("index") REFERENCES "members"("index") ON DELETE CASCADE ON UPDATE CASCADE
        `);
		await queryRunner.query(`
            ALTER TABLE "member_roles"
            ADD CONSTRAINT "FK_e9080e7a7997a0170026d5139c1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
		await queryRunner.query(`
            ALTER TABLE "message_user_mentions"
            ADD CONSTRAINT "FK_a343387fc560ef378760681c236" FOREIGN KEY ("messagesId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
		await queryRunner.query(`
            ALTER TABLE "message_user_mentions"
            ADD CONSTRAINT "FK_b831eb18ceebd28976239b1e2f8" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
		await queryRunner.query(`
            ALTER TABLE "message_role_mentions"
            ADD CONSTRAINT "FK_a8242cf535337a490b0feaea0b4" FOREIGN KEY ("messagesId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
		await queryRunner.query(`
            ALTER TABLE "message_role_mentions"
            ADD CONSTRAINT "FK_29d63eb1a458200851bc37d074b" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
		await queryRunner.query(`
            ALTER TABLE "message_channel_mentions"
            ADD CONSTRAINT "FK_2a27102ecd1d81b4582a4360921" FOREIGN KEY ("messagesId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
		await queryRunner.query(`
            ALTER TABLE "message_channel_mentions"
            ADD CONSTRAINT "FK_bdb8c09e1464cabf62105bf4b9d" FOREIGN KEY ("channelsId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
		await queryRunner.query(`
            ALTER TABLE "message_stickers"
            ADD CONSTRAINT "FK_40bb6f23e7cc133292e92829d28" FOREIGN KEY ("messagesId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
		await queryRunner.query(`
            ALTER TABLE "message_stickers"
            ADD CONSTRAINT "FK_e22a70819d07659c7a71c112a1f" FOREIGN KEY ("stickersId") REFERENCES "stickers"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
		await queryRunner.query(`
            CREATE TABLE "query-result-cache" (
                "id" SERIAL NOT NULL,
                "identifier" character varying,
                "time" bigint NOT NULL,
                "duration" integer NOT NULL,
                "query" text NOT NULL,
                "result" text NOT NULL,
                CONSTRAINT "PK_6a98f758d8bfd010e7e10ffd3d3" PRIMARY KEY ("id")
            )
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            DROP TABLE "query-result-cache"
        `);
		await queryRunner.query(`
            ALTER TABLE "message_stickers" DROP CONSTRAINT "FK_e22a70819d07659c7a71c112a1f"
        `);
		await queryRunner.query(`
            ALTER TABLE "message_stickers" DROP CONSTRAINT "FK_40bb6f23e7cc133292e92829d28"
        `);
		await queryRunner.query(`
            ALTER TABLE "message_channel_mentions" DROP CONSTRAINT "FK_bdb8c09e1464cabf62105bf4b9d"
        `);
		await queryRunner.query(`
            ALTER TABLE "message_channel_mentions" DROP CONSTRAINT "FK_2a27102ecd1d81b4582a4360921"
        `);
		await queryRunner.query(`
            ALTER TABLE "message_role_mentions" DROP CONSTRAINT "FK_29d63eb1a458200851bc37d074b"
        `);
		await queryRunner.query(`
            ALTER TABLE "message_role_mentions" DROP CONSTRAINT "FK_a8242cf535337a490b0feaea0b4"
        `);
		await queryRunner.query(`
            ALTER TABLE "message_user_mentions" DROP CONSTRAINT "FK_b831eb18ceebd28976239b1e2f8"
        `);
		await queryRunner.query(`
            ALTER TABLE "message_user_mentions" DROP CONSTRAINT "FK_a343387fc560ef378760681c236"
        `);
		await queryRunner.query(`
            ALTER TABLE "member_roles" DROP CONSTRAINT "FK_e9080e7a7997a0170026d5139c1"
        `);
		await queryRunner.query(`
            ALTER TABLE "member_roles" DROP CONSTRAINT "FK_5d7ddc8a5f9c167f548625e772e"
        `);
		await queryRunner.query(`
            ALTER TABLE "notes" DROP CONSTRAINT "FK_23e08e5b4481711d573e1abecdc"
        `);
		await queryRunner.query(`
            ALTER TABLE "notes" DROP CONSTRAINT "FK_f9e103f8ae67cb1787063597925"
        `);
		await queryRunner.query(`
            ALTER TABLE "sticker_packs" DROP CONSTRAINT "FK_448fafba4355ee1c837bbc865f1"
        `);
		await queryRunner.query(`
            ALTER TABLE "sessions" DROP CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19"
        `);
		await queryRunner.query(`
            ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0"
        `);
		await queryRunner.query(`
            ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_3cd01cd3ae7aab010310d96ac8e"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP CONSTRAINT "FK_e5bf78cdbbe9ba91062d74c5aba"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP CONSTRAINT "FK_a36ed02953077f408d0f3ebc424"
        `);
		await queryRunner.query(`
            ALTER TABLE "applications" DROP CONSTRAINT "FK_e57508958bf92b9d9d25231b5e8"
        `);
		await queryRunner.query(`
            ALTER TABLE "teams" DROP CONSTRAINT "FK_13f00abf7cb6096c43ecaf8c108"
        `);
		await queryRunner.query(`
            ALTER TABLE "team_members" DROP CONSTRAINT "FK_c2bf4967c8c2a6b845dadfbf3d4"
        `);
		await queryRunner.query(`
            ALTER TABLE "team_members" DROP CONSTRAINT "FK_fdad7d5768277e60c40e01cdcea"
        `);
		await queryRunner.query(`
            ALTER TABLE "guilds" DROP CONSTRAINT "FK_9d1d665379eefde7876a17afa99"
        `);
		await queryRunner.query(`
            ALTER TABLE "guilds" DROP CONSTRAINT "FK_cfc3d3ad260f8121c95b31a1fce"
        `);
		await queryRunner.query(`
            ALTER TABLE "guilds" DROP CONSTRAINT "FK_95828668aa333460582e0ca6396"
        `);
		await queryRunner.query(`
            ALTER TABLE "guilds" DROP CONSTRAINT "FK_8d450b016dc8bec35f36729e4b0"
        `);
		await queryRunner.query(`
            ALTER TABLE "guilds" DROP CONSTRAINT "FK_fc1a451727e3643ca572a3bb394"
        `);
		await queryRunner.query(`
            ALTER TABLE "guilds" DROP CONSTRAINT "FK_e2a2f873a64a5cf62526de42325"
        `);
		await queryRunner.query(`
            ALTER TABLE "guilds" DROP CONSTRAINT "FK_f591a66b8019d87b0fe6c12dad6"
        `);
		await queryRunner.query(`
            ALTER TABLE "templates" DROP CONSTRAINT "FK_445d00eaaea0e60a017a5ed0c11"
        `);
		await queryRunner.query(`
            ALTER TABLE "templates" DROP CONSTRAINT "FK_d7374b7f8f5fbfdececa4fb62e1"
        `);
		await queryRunner.query(`
            ALTER TABLE "emojis" DROP CONSTRAINT "FK_fa7ddd5f9a214e28ce596548421"
        `);
		await queryRunner.query(`
            ALTER TABLE "emojis" DROP CONSTRAINT "FK_4b988e0db89d94cebcf07f598cc"
        `);
		await queryRunner.query(`
            ALTER TABLE "channels" DROP CONSTRAINT "FK_3873ed438575cce703ecff4fc7b"
        `);
		await queryRunner.query(`
            ALTER TABLE "channels" DROP CONSTRAINT "FK_3274522d14af40540b1a883fc80"
        `);
		await queryRunner.query(`
            ALTER TABLE "channels" DROP CONSTRAINT "FK_c253dafe5f3a03ec00cd8fb4581"
        `);
		await queryRunner.query(`
            ALTER TABLE "voice_states" DROP CONSTRAINT "FK_5fe1d5f931a67e85039c640001b"
        `);
		await queryRunner.query(`
            ALTER TABLE "voice_states" DROP CONSTRAINT "FK_9f8d389866b40b6657edd026dd4"
        `);
		await queryRunner.query(`
            ALTER TABLE "voice_states" DROP CONSTRAINT "FK_03779ef216d4b0358470d9cb748"
        `);
		await queryRunner.query(`
            ALTER TABLE "invites" DROP CONSTRAINT "FK_11a0d394f8fc649c19ce5f16b59"
        `);
		await queryRunner.query(`
            ALTER TABLE "invites" DROP CONSTRAINT "FK_15c35422032e0b22b4ada95f48f"
        `);
		await queryRunner.query(`
            ALTER TABLE "invites" DROP CONSTRAINT "FK_6a15b051fe5050aa00a4b9ff0f6"
        `);
		await queryRunner.query(`
            ALTER TABLE "invites" DROP CONSTRAINT "FK_3f4939aa1461e8af57fea3fb05d"
        `);
		await queryRunner.query(`
            ALTER TABLE "read_states" DROP CONSTRAINT "FK_195f92e4dd1254a4e348c043763"
        `);
		await queryRunner.query(`
            ALTER TABLE "read_states" DROP CONSTRAINT "FK_40da2fca4e0eaf7a23b5bfc5d34"
        `);
		await queryRunner.query(`
            ALTER TABLE "messages" DROP CONSTRAINT "FK_61a92bb65b302a76d9c1fcd3174"
        `);
		await queryRunner.query(`
            ALTER TABLE "messages" DROP CONSTRAINT "FK_5d3ec1cb962de6488637fd779d6"
        `);
		await queryRunner.query(`
            ALTER TABLE "messages" DROP CONSTRAINT "FK_f83c04bcf1df4e5c0e7a52ed348"
        `);
		await queryRunner.query(`
            ALTER TABLE "messages" DROP CONSTRAINT "FK_b0525304f2262b7014245351c76"
        `);
		await queryRunner.query(`
            ALTER TABLE "messages" DROP CONSTRAINT "FK_05535bc695e9f7ee104616459d3"
        `);
		await queryRunner.query(`
            ALTER TABLE "messages" DROP CONSTRAINT "FK_b193588441b085352a4c0109423"
        `);
		await queryRunner.query(`
            ALTER TABLE "messages" DROP CONSTRAINT "FK_86b9109b155eb70c0a2ca3b4b6d"
        `);
		await queryRunner.query(`
            ALTER TABLE "attachments" DROP CONSTRAINT "FK_623e10eec51ada466c5038979e3"
        `);
		await queryRunner.query(`
            ALTER TABLE "stickers" DROP CONSTRAINT "FK_8f4ee73f2bb2325ff980502e158"
        `);
		await queryRunner.query(`
            ALTER TABLE "stickers" DROP CONSTRAINT "FK_193d551d852aca5347ef5c9f205"
        `);
		await queryRunner.query(`
            ALTER TABLE "stickers" DROP CONSTRAINT "FK_e7cfa5cefa6661b3fb8fda8ce69"
        `);
		await queryRunner.query(`
            ALTER TABLE "webhooks" DROP CONSTRAINT "FK_3a285f4f49c40e0706d3018bc9f"
        `);
		await queryRunner.query(`
            ALTER TABLE "webhooks" DROP CONSTRAINT "FK_0d523f6f997c86e052c49b1455f"
        `);
		await queryRunner.query(`
            ALTER TABLE "webhooks" DROP CONSTRAINT "FK_c3e5305461931763b56aa905f1c"
        `);
		await queryRunner.query(`
            ALTER TABLE "webhooks" DROP CONSTRAINT "FK_df528cf77e82f8032230e7e37d8"
        `);
		await queryRunner.query(`
            ALTER TABLE "webhooks" DROP CONSTRAINT "FK_487a7af59d189f744fe394368fc"
        `);
		await queryRunner.query(`
            ALTER TABLE "members" DROP CONSTRAINT "FK_16aceddd5b89825b8ed6029ad1c"
        `);
		await queryRunner.query(`
            ALTER TABLE "members" DROP CONSTRAINT "FK_28b53062261b996d9c99fa12404"
        `);
		await queryRunner.query(`
            ALTER TABLE "roles" DROP CONSTRAINT "FK_c32c1ab1c4dc7dcb0278c4b1b8b"
        `);
		await queryRunner.query(`
            ALTER TABLE "recipients" DROP CONSTRAINT "FK_6157e8b6ba4e6e3089616481fe2"
        `);
		await queryRunner.query(`
            ALTER TABLE "recipients" DROP CONSTRAINT "FK_2f18ee1ba667f233ae86c0ea60e"
        `);
		await queryRunner.query(`
            ALTER TABLE "bans" DROP CONSTRAINT "FK_07ad88c86d1f290d46748410d58"
        `);
		await queryRunner.query(`
            ALTER TABLE "bans" DROP CONSTRAINT "FK_9d3ab7dd180ebdd245cdb66ecad"
        `);
		await queryRunner.query(`
            ALTER TABLE "bans" DROP CONSTRAINT "FK_5999e8e449f80a236ff72023559"
        `);
		await queryRunner.query(`
            ALTER TABLE "backup_codes" DROP CONSTRAINT "FK_70066ea80d2f4b871beda32633b"
        `);
		await queryRunner.query(`
            ALTER TABLE "connected_accounts" DROP CONSTRAINT "FK_f47244225a6a1eac04a3463dd90"
        `);
		await queryRunner.query(`
            ALTER TABLE "relationships" DROP CONSTRAINT "FK_9c7f6b98a9843b76dce1b0c878b"
        `);
		await queryRunner.query(`
            ALTER TABLE "relationships" DROP CONSTRAINT "FK_9af4194bab1250b1c584ae4f1d7"
        `);
		await queryRunner.query(`
            DROP INDEX "public"."IDX_e22a70819d07659c7a71c112a1"
        `);
		await queryRunner.query(`
            DROP INDEX "public"."IDX_40bb6f23e7cc133292e92829d2"
        `);
		await queryRunner.query(`
            DROP TABLE "message_stickers"
        `);
		await queryRunner.query(`
            DROP INDEX "public"."IDX_bdb8c09e1464cabf62105bf4b9"
        `);
		await queryRunner.query(`
            DROP INDEX "public"."IDX_2a27102ecd1d81b4582a436092"
        `);
		await queryRunner.query(`
            DROP TABLE "message_channel_mentions"
        `);
		await queryRunner.query(`
            DROP INDEX "public"."IDX_29d63eb1a458200851bc37d074"
        `);
		await queryRunner.query(`
            DROP INDEX "public"."IDX_a8242cf535337a490b0feaea0b"
        `);
		await queryRunner.query(`
            DROP TABLE "message_role_mentions"
        `);
		await queryRunner.query(`
            DROP INDEX "public"."IDX_b831eb18ceebd28976239b1e2f"
        `);
		await queryRunner.query(`
            DROP INDEX "public"."IDX_a343387fc560ef378760681c23"
        `);
		await queryRunner.query(`
            DROP TABLE "message_user_mentions"
        `);
		await queryRunner.query(`
            DROP INDEX "public"."IDX_e9080e7a7997a0170026d5139c"
        `);
		await queryRunner.query(`
            DROP INDEX "public"."IDX_5d7ddc8a5f9c167f548625e772"
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
            DROP INDEX "public"."IDX_0abf8b443321bd3cf7f81ee17a"
        `);
		await queryRunner.query(`
            DROP TABLE "read_states"
        `);
		await queryRunner.query(`
            DROP INDEX "public"."IDX_3ed7a60fb7dbe04e1ba9332a8b"
        `);
		await queryRunner.query(`
            DROP INDEX "public"."IDX_05535bc695e9f7ee104616459d"
        `);
		await queryRunner.query(`
            DROP INDEX "public"."IDX_86b9109b155eb70c0a2ca3b4b6"
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
            DROP INDEX "public"."IDX_bb2bf9386ac443afbbbf9f12d3"
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
            DROP INDEX "public"."IDX_a0b2ff0a598df0b0d055934a17"
        `);
		await queryRunner.query(`
            DROP TABLE "relationships"
        `);
		await queryRunner.query(`
            DROP TABLE "config"
        `);
	}
}
