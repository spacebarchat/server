import { MigrationInterface, QueryRunner } from "typeorm";

export class ReconcileTypeormModels1783086174271 implements MigrationInterface {
    name = "ReconcileTypeormModels1783086174271";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application_commands" DROP CONSTRAINT "application_commands_applications_fk"`);
        await queryRunner.query(`ALTER TABLE "automod_rules" DROP CONSTRAINT "FK_automod_rule_guild_id"`);
        await queryRunner.query(`ALTER TABLE "webhooks" DROP CONSTRAINT "FK_webhook_application_id"`);
        await queryRunner.query(`ALTER TABLE "thread_members" DROP CONSTRAINT "FK_thread_member_member_index"`);
        await queryRunner.query(`ALTER TABLE "guilds" DROP CONSTRAINT "FK_guild_primary_category_id"`);
        await queryRunner.query(`ALTER TABLE "guilds" DROP CONSTRAINT "FK_guild_owner_id"`);
        await queryRunner.query(`ALTER TABLE "message_user_mentions" DROP CONSTRAINT "FK_message_user_mentions_user_id"`);
        await queryRunner.query(`ALTER TABLE "message_user_mentions" DROP CONSTRAINT "FK_message_user_mentions_message_id"`);
        await queryRunner.query(`ALTER TABLE "message_role_mentions" DROP CONSTRAINT "FK_message_role_mention_role_id"`);
        await queryRunner.query(`ALTER TABLE "message_role_mentions" DROP CONSTRAINT "FK_message_role_mention_message_id"`);
        await queryRunner.query(`ALTER TABLE "message_channel_mentions" DROP CONSTRAINT "FK_message_channel_mention_channel_id"`);
        await queryRunner.query(`ALTER TABLE "message_channel_mentions" DROP CONSTRAINT "FK_message_channel_mention_message_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a343387fc560ef378760681c23"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b831eb18ceebd28976239b1e2f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a8242cf535337a490b0feaea0b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_29d63eb1a458200851bc37d074"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bdb8c09e1464cabf62105bf4b9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2a27102ecd1d81b4582a436092"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_40bb6f23e7cc133292e92829d2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e22a70819d07659c7a71c112a1"`);
        await queryRunner.query(
            `CREATE TABLE "report_menus" ("id" bigint NOT NULL, "type" integer NOT NULL, "variant" character varying NOT NULL, "isCurrent" boolean NOT NULL, "inherits" character varying, "content" jsonb NOT NULL, CONSTRAINT "PK_1b5d649a189d57579d558ace79f" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(`ALTER TABLE "application_commands" ALTER COLUMN "version" SET DEFAULT '0::bigint'`);
        await queryRunner.query(`ALTER TABLE "embed_cache" ALTER COLUMN "created_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "security_settings" DROP COLUMN "allowed_algorithms"`);
        await queryRunner.query(`ALTER TABLE "security_settings" ADD "allowed_algorithms" character varying array NOT NULL`);
        await queryRunner.query(`ALTER TABLE "applications" DROP CONSTRAINT "FK_application_owner_id"`);
        await queryRunner.query(`ALTER TABLE "applications" ALTER COLUMN "owner_id" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_972e8e013af7698f8aa8bc3fc8" ON "message_user_mentions"  ("message_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_16395c9069e88c5f93cd658e9a" ON "message_user_mentions"  ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_30114cbe788f0affbd8b8bf1f1" ON "message_role_mentions"  ("message_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_ce866308ad8ddf9b6abce06b33" ON "message_role_mentions"  ("role_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_900f52a6d0f53bdcb2e9079017" ON "message_channel_mentions"  ("message_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_32f530caa79d0e7d295eb59f62" ON "message_channel_mentions"  ("channel_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_724f8b11056c706429933bdf87" ON "message_stickers"  ("message_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_2b34e1145cafb79c6c5c193d12" ON "message_stickers"  ("sticker_id") `);
        await queryRunner.query(
            `ALTER TABLE "webhooks" ADD CONSTRAINT "FK_webhook_application_id" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "thread_members" ADD CONSTRAINT "FK_thread_member_member_id" FOREIGN KEY ("member_idx") REFERENCES "members"("index") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "guilds" ADD CONSTRAINT "FK_guild_owner_id" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "applications" ADD CONSTRAINT "FK_application_owner_id" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "message_user_mentions" ADD CONSTRAINT "FK_message_mentions_message_id" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "message_user_mentions" ADD CONSTRAINT "FK_message_mentions_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "message_role_mentions" ADD CONSTRAINT "FK_message_role_mentions_message_id" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "message_role_mentions" ADD CONSTRAINT "FK_message_role_mentions_role_id" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "message_channel_mentions" ADD CONSTRAINT "FK_message_channel_mentions_message_id" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "message_channel_mentions" ADD CONSTRAINT "FK_message_channel_mentions_channel_id" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message_channel_mentions" DROP CONSTRAINT "FK_message_channel_mentions_channel_id"`);
        await queryRunner.query(`ALTER TABLE "message_channel_mentions" DROP CONSTRAINT "FK_message_channel_mentions_message_id"`);
        await queryRunner.query(`ALTER TABLE "message_role_mentions" DROP CONSTRAINT "FK_message_role_mentions_role_id"`);
        await queryRunner.query(`ALTER TABLE "message_role_mentions" DROP CONSTRAINT "FK_message_role_mentions_message_id"`);
        await queryRunner.query(`ALTER TABLE "message_user_mentions" DROP CONSTRAINT "FK_message_mentions_user_id"`);
        await queryRunner.query(`ALTER TABLE "message_user_mentions" DROP CONSTRAINT "FK_message_mentions_message_id"`);
        await queryRunner.query(`ALTER TABLE "applications" DROP CONSTRAINT "FK_application_owner_id"`);
        await queryRunner.query(`ALTER TABLE "guilds" DROP CONSTRAINT "FK_guild_owner_id"`);
        await queryRunner.query(`ALTER TABLE "thread_members" DROP CONSTRAINT "FK_thread_member_member_id"`);
        await queryRunner.query(`ALTER TABLE "webhooks" DROP CONSTRAINT "FK_webhook_application_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2b34e1145cafb79c6c5c193d12"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_724f8b11056c706429933bdf87"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_32f530caa79d0e7d295eb59f62"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_900f52a6d0f53bdcb2e9079017"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ce866308ad8ddf9b6abce06b33"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_30114cbe788f0affbd8b8bf1f1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_16395c9069e88c5f93cd658e9a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_972e8e013af7698f8aa8bc3fc8"`);
        await queryRunner.query(`ALTER TABLE "applications" ALTER COLUMN "owner_id" DROP NOT NULL`);
        await queryRunner.query(
            `ALTER TABLE "applications" ADD CONSTRAINT "FK_application_owner_id" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(`ALTER TABLE "security_settings" DROP COLUMN "allowed_algorithms"`);
        await queryRunner.query(`ALTER TABLE "security_settings" ADD "allowed_algorithms" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "embed_cache" ALTER COLUMN "created_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "application_commands" ALTER COLUMN "version" SET DEFAULT (0)`);
        await queryRunner.query(`DROP TABLE "report_menus"`);
        await queryRunner.query(`CREATE INDEX "IDX_e22a70819d07659c7a71c112a1" ON "message_stickers" USING btree ("sticker_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_40bb6f23e7cc133292e92829d2" ON "message_stickers" USING btree ("message_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_2a27102ecd1d81b4582a436092" ON "message_channel_mentions" USING btree ("message_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_bdb8c09e1464cabf62105bf4b9" ON "message_channel_mentions" USING btree ("channel_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_29d63eb1a458200851bc37d074" ON "message_role_mentions" USING btree ("role_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a8242cf535337a490b0feaea0b" ON "message_role_mentions" USING btree ("message_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b831eb18ceebd28976239b1e2f" ON "message_user_mentions" USING btree ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a343387fc560ef378760681c23" ON "message_user_mentions" USING btree ("message_id") `);
        await queryRunner.query(
            `ALTER TABLE "message_channel_mentions" ADD CONSTRAINT "FK_message_channel_mention_message_id" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "message_channel_mentions" ADD CONSTRAINT "FK_message_channel_mention_channel_id" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "message_role_mentions" ADD CONSTRAINT "FK_message_role_mention_message_id" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "message_role_mentions" ADD CONSTRAINT "FK_message_role_mention_role_id" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "message_user_mentions" ADD CONSTRAINT "FK_message_user_mentions_message_id" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "message_user_mentions" ADD CONSTRAINT "FK_message_user_mentions_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(`ALTER TABLE "guilds" ADD CONSTRAINT "FK_guild_owner_id" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(
            `ALTER TABLE "guilds" ADD CONSTRAINT "FK_guild_primary_category_id" FOREIGN KEY ("primary_category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "thread_members" ADD CONSTRAINT "FK_thread_member_member_index" FOREIGN KEY ("member_idx") REFERENCES "members"("index") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "webhooks" ADD CONSTRAINT "FK_webhook_application_id" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "automod_rules" ADD CONSTRAINT "FK_automod_rule_guild_id" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "application_commands" ADD CONSTRAINT "application_commands_applications_fk" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }
}
