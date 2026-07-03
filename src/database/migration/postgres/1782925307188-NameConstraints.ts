import { MigrationInterface, QueryRunner } from "typeorm";

export class NameConstraints1782925307188 implements MigrationInterface {
    name = "NameConstraints1782925307188";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "instance_bans" RENAME CONSTRAINT "FK_0b02d18d0d830f160c921192a30" TO "FK_origin_instance_ban_id"`);

        await queryRunner.query(`ALTER TABLE "applications" RENAME CONSTRAINT "FK_2ce5a55796fe4c2f77ece57a647" TO "FK_application_bot_user_id"`);
        await queryRunner.query(`ALTER TABLE "applications" RENAME CONSTRAINT "FK_a36ed02953077f408d0f3ebc424" TO "FK_application_team_id"`);
        await queryRunner.query(`ALTER TABLE "applications" RENAME CONSTRAINT "FK_e57508958bf92b9d9d25231b5e8" TO "FK_application_owner_id"`);
        await queryRunner.query(`ALTER TABLE "applications" RENAME CONSTRAINT "FK_e5bf78cdbbe9ba91062d74c5aba" TO "FK_application_guild_id"`);

        await queryRunner.query(`ALTER TABLE "attachments" RENAME CONSTRAINT "FK_623e10eec51ada466c5038979e3" TO "FK_attachment_message_id"`);
        await queryRunner.query(`ALTER TABLE "attachments" RENAME CONSTRAINT "attachments_channels_fk" TO "FK_attachment_channel_id"`);

        await queryRunner.query(`ALTER TABLE "audit_logs" RENAME CONSTRAINT "FK_3cd01cd3ae7aab010310d96ac8e" TO "FK_audit_log_target_user_id"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" RENAME CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0" TO "FK_audit_log_source_user_id"`);

        await queryRunner.query(`ALTER TABLE "automod_rules" RENAME CONSTRAINT "FK_12d3d60b961393d310429c062b7" TO "FK_automod_rule_creator_id"`);
        await queryRunner.query(`ALTER TABLE "automod_rules" RENAME CONSTRAINT "automod_rules_guilds_fk" TO "FK_automod_rule_guild_id"`);

        await queryRunner.query(`ALTER TABLE "bans" RENAME CONSTRAINT "FK_07ad88c86d1f290d46748410d58" TO "FK_ban_executor_id"`);
        await queryRunner.query(`ALTER TABLE "bans" RENAME CONSTRAINT "FK_5999e8e449f80a236ff72023559" TO "FK_ban_user_id"`);
        await queryRunner.query(`ALTER TABLE "bans" RENAME CONSTRAINT "FK_9d3ab7dd180ebdd245cdb66ecad" TO "FK_ban_guild_id"`);

        await queryRunner.query(`ALTER TABLE "channels" RENAME CONSTRAINT "FK_3274522d14af40540b1a883fc80" TO "FK_channel_parent_id"`);
        await queryRunner.query(`ALTER TABLE "channels" RENAME CONSTRAINT "FK_3873ed438575cce703ecff4fc7b" TO "FK_channel_owner_id"`);
        await queryRunner.query(`ALTER TABLE "channels" RENAME CONSTRAINT "FK_c253dafe5f3a03ec00cd8fb4581" TO "FK_channel_guild_id"`);

        await queryRunner.query(`ALTER TABLE "cloud_attachments" RENAME CONSTRAINT "FK_8bf8cc8767e48cb482ff644fce6" TO "FK_cloud_attachment_user_id"`);
        await queryRunner.query(`ALTER TABLE "cloud_attachments" RENAME CONSTRAINT "FK_998d5fe91008ba5b09e1322104c" TO "FK_cloud_attachment_channel_id"`);

        await queryRunner.query(`ALTER TABLE "connected_accounts" RENAME CONSTRAINT "FK_f47244225a6a1eac04a3463dd90" TO "FK_connected_account_user_id"`);

        await queryRunner.query(`ALTER TABLE "emojis" RENAME CONSTRAINT "FK_4b988e0db89d94cebcf07f598cc" TO "FK_emoji_guild_id"`);
        await queryRunner.query(`ALTER TABLE "emojis" RENAME CONSTRAINT "FK_fa7ddd5f9a214e28ce596548421" TO "FK_emoji_user_id"`);

        await queryRunner.query(`ALTER TABLE "guilds" RENAME CONSTRAINT "FK_8d450b016dc8bec35f36729e4b0" TO "FK_guild_public_updates_channel_id"`);
        await queryRunner.query(`ALTER TABLE "guilds" RENAME CONSTRAINT "FK_95828668aa333460582e0ca6396" TO "FK_guild_rules_channel_id"`);
        await queryRunner.query(`ALTER TABLE "guilds" RENAME CONSTRAINT "FK_9d1d665379eefde7876a17afa99" TO "FK_guild_widget_channel_id"`);
        await queryRunner.query(`ALTER TABLE "guilds" RENAME CONSTRAINT "FK_cfc3d3ad260f8121c95b31a1fce" TO "FK_guild_system_channel_id"`);
        await queryRunner.query(`ALTER TABLE "guilds" RENAME CONSTRAINT "FK_e2a2f873a64a5cf62526de42325" TO "FK_guild_template_id"`);
        await queryRunner.query(`ALTER TABLE "guilds" RENAME CONSTRAINT "FK_f591a66b8019d87b0fe6c12dad6" TO "FK_guild_afk_channel_id"`);
        await queryRunner.query(`ALTER TABLE "guilds" RENAME CONSTRAINT "FK_fc1a451727e3643ca572a3bb394" TO "FK_guild_owner_id"`);
        await queryRunner.query(`ALTER TABLE "guilds" RENAME CONSTRAINT "guilds_categories_fk" TO "FK_guild_primary_category_id"`);

        await queryRunner.query(`ALTER TABLE "invites" RENAME CONSTRAINT "FK_11a0d394f8fc649c19ce5f16b59" TO "FK_invite_target_user_id"`);
        await queryRunner.query(`ALTER TABLE "invites" RENAME CONSTRAINT "FK_15c35422032e0b22b4ada95f48f" TO "FK_invite_inviter_id"`);
        await queryRunner.query(`ALTER TABLE "invites" RENAME CONSTRAINT "FK_3f4939aa1461e8af57fea3fb05d" TO "FK_invite_guild_id"`);
        await queryRunner.query(`ALTER TABLE "invites" RENAME CONSTRAINT "FK_6a15b051fe5050aa00a4b9ff0f6" TO "FK_invite_channel_id"`);

        await queryRunner.query(`ALTER TABLE "member_roles" RENAME CONSTRAINT "FK_5d7ddc8a5f9c167f548625e772e" TO "FK_member_role_member_index"`);
        await queryRunner.query(`ALTER TABLE "member_roles" RENAME CONSTRAINT "FK_e9080e7a7997a0170026d5139c1" TO "FK_member_role_role_id"`);

        await queryRunner.query(`ALTER TABLE "members" RENAME CONSTRAINT "FK_16aceddd5b89825b8ed6029ad1c" TO "FK_member_guild_id"`);
        await queryRunner.query(`ALTER TABLE "members" RENAME CONSTRAINT "FK_28b53062261b996d9c99fa12404" TO "FK_member_user_id"`);

        await queryRunner.query(`ALTER TABLE "message_channel_mentions" RENAME CONSTRAINT "FK_2a27102ecd1d81b4582a4360921" TO "FK_message_channel_mention_message_id"`);
        await queryRunner.query(`ALTER TABLE "message_channel_mentions" RENAME CONSTRAINT "FK_bdb8c09e1464cabf62105bf4b9d" TO "FK_message_channel_mention_channel_id"`);

        await queryRunner.query(`ALTER TABLE "message_role_mentions" RENAME CONSTRAINT "FK_a8242cf535337a490b0feaea0b4" TO "FK_message_role_mention_message_id"`);
        await queryRunner.query(`ALTER TABLE "message_role_mentions" RENAME CONSTRAINT "FK_29d63eb1a458200851bc37d074b" TO "FK_message_role_mention_role_id"`);

        await queryRunner.query(`ALTER TABLE "message_stickers" RENAME CONSTRAINT "FK_40bb6f23e7cc133292e92829d28" TO "FK_message_stickers_message_id"`);
        await queryRunner.query(`ALTER TABLE "message_stickers" RENAME CONSTRAINT "FK_e22a70819d07659c7a71c112a1f" TO "FK_message_stickers_sticker_id"`);

        await queryRunner.query(`ALTER TABLE "message_user_mentions" RENAME CONSTRAINT "FK_a343387fc560ef378760681c236" TO "FK_message_user_mentions_message_id"`);
        await queryRunner.query(`ALTER TABLE "message_user_mentions" RENAME CONSTRAINT "FK_b831eb18ceebd28976239b1e2f8" TO "FK_message_user_mentions_user_id"`);

        await queryRunner.query(`ALTER TABLE "messages" RENAME CONSTRAINT "FK_05535bc695e9f7ee104616459d3" TO "FK_message_author_id"`);
        await queryRunner.query(`ALTER TABLE "messages" RENAME CONSTRAINT "FK_5d3ec1cb962de6488637fd779d6" TO "FK_message_application_id"`);
        await queryRunner.query(`ALTER TABLE "messages" RENAME CONSTRAINT "FK_61a92bb65b302a76d9c1fcd3174" TO "FK_message_message_reference_id"`);
        await queryRunner.query(`ALTER TABLE "messages" RENAME CONSTRAINT "FK_86b9109b155eb70c0a2ca3b4b6d" TO "FK_message_channel_id"`);
        await queryRunner.query(`ALTER TABLE "messages" RENAME CONSTRAINT "FK_b0525304f2262b7014245351c76" TO "FK_message_member_id"`);
        await queryRunner.query(`ALTER TABLE "messages" RENAME CONSTRAINT "FK_b193588441b085352a4c0109423" TO "FK_message_guild_id"`);
        await queryRunner.query(`ALTER TABLE "messages" RENAME CONSTRAINT "FK_bb3af7f695d50083e6523290d41" TO "FK_message_thread_id"`);
        await queryRunner.query(`ALTER TABLE "messages" RENAME CONSTRAINT "FK_f83c04bcf1df4e5c0e7a52ed348" TO "FK_message_webhook_id"`);

        await queryRunner.query(`ALTER TABLE "notes" RENAME CONSTRAINT "FK_23e08e5b4481711d573e1abecdc" TO "FK_note_target_id"`);
        await queryRunner.query(`ALTER TABLE "notes" RENAME CONSTRAINT "FK_f9e103f8ae67cb1787063597925" TO "FK_note_owner_id"`);

        await queryRunner.query(`ALTER TABLE "read_states" RENAME CONSTRAINT "FK_195f92e4dd1254a4e348c043763" TO "FK_read_state_user_id"`);
        await queryRunner.query(`ALTER TABLE "read_states" RENAME CONSTRAINT "FK_40da2fca4e0eaf7a23b5bfc5d34" TO "FK_read_state_channel_id"`);

        await queryRunner.query(`ALTER TABLE "recipients" RENAME CONSTRAINT "FK_2f18ee1ba667f233ae86c0ea60e" TO "FK_recipient_channel_id"`);
        await queryRunner.query(`ALTER TABLE "recipients" RENAME CONSTRAINT "FK_6157e8b6ba4e6e3089616481fe2" TO "FK_recipient_user_id"`);

        await queryRunner.query(`ALTER TABLE "relationships" RENAME CONSTRAINT "FK_9af4194bab1250b1c584ae4f1d7" TO "FK_relationship_from_id"`);
        await queryRunner.query(`ALTER TABLE "relationships" RENAME CONSTRAINT "FK_9c7f6b98a9843b76dce1b0c878b" TO "FK_relationship_to_id"`);

        await queryRunner.query(`ALTER TABLE "roles" RENAME CONSTRAINT "FK_c32c1ab1c4dc7dcb0278c4b1b8b" TO "FK_role_guild_id"`);

        await queryRunner.query(`ALTER TABLE "security_keys" RENAME CONSTRAINT "FK_24c97d0771cafedce6d7163eaad" TO "FK_security_key_user_id"`);

        await queryRunner.query(`ALTER TABLE "sessions" RENAME CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" TO "FK_session_user_id"`);

        await queryRunner.query(`ALTER TABLE "sticker_packs" RENAME CONSTRAINT "FK_448fafba4355ee1c837bbc865f1" TO "FK_sticker_pack_cover_sticker_id"`);

        await queryRunner.query(`ALTER TABLE "stickers" RENAME CONSTRAINT "FK_193d551d852aca5347ef5c9f205" TO "FK_sticker_guild_id"`);
        await queryRunner.query(`ALTER TABLE "stickers" RENAME CONSTRAINT "FK_8f4ee73f2bb2325ff980502e158" TO "FK_sticker_user_id"`);
        await queryRunner.query(`ALTER TABLE "stickers" RENAME CONSTRAINT "FK_e7cfa5cefa6661b3fb8fda8ce69" TO "FK_sticker_pack_id"`);

        await queryRunner.query(`ALTER TABLE "stream_sessions" RENAME CONSTRAINT "FK_13ae5c29aff4d0890c54179511a" TO "FK_stream_session_user_id"`);
        await queryRunner.query(`ALTER TABLE "stream_sessions" RENAME CONSTRAINT "FK_8b5a028a34dae9ee54af37c9c32" TO "FK_stream_session_stream_id"`);

        await queryRunner.query(`ALTER TABLE "streams" RENAME CONSTRAINT "FK_1b566f9b54d1cda271da53ac82f" TO "FK_stream_owner_id"`);
        await queryRunner.query(`ALTER TABLE "streams" RENAME CONSTRAINT "FK_5101f0cded27ff0aae78fc4eed7" TO "FK_stream_channel_id"`);

        await queryRunner.query(`ALTER TABLE "tags" RENAME CONSTRAINT "FK_2e2df07f6dacc12e1932b361fe4" TO "FK_tag_channel_id"`);

        await queryRunner.query(`ALTER TABLE "team_members" RENAME CONSTRAINT "FK_c2bf4967c8c2a6b845dadfbf3d4" TO "FK_team_member_user_id"`);
        await queryRunner.query(`ALTER TABLE "team_members" RENAME CONSTRAINT "FK_fdad7d5768277e60c40e01cdcea" TO "FK_team_member_team_id"`);

        await queryRunner.query(`ALTER TABLE "teams" RENAME CONSTRAINT "FK_13f00abf7cb6096c43ecaf8c108" TO "FK_team_owner_user_id"`);

        await queryRunner.query(`ALTER TABLE "templates" RENAME CONSTRAINT "FK_445d00eaaea0e60a017a5ed0c11" TO "FK_template_source_guild_id"`);
        await queryRunner.query(`ALTER TABLE "templates" RENAME CONSTRAINT "FK_d7374b7f8f5fbfdececa4fb62e1" TO "FK_template_creator_id"`);

        await queryRunner.query(`ALTER TABLE "thread_members" RENAME CONSTRAINT "FK_4721015b4e24ad29da55dbd2de0" TO "FK_thread_member_member_index"`);
        await queryRunner.query(`ALTER TABLE "thread_members" RENAME CONSTRAINT "FK_cf20e37d71b0e1bf1ab633861c8" TO "FK_thread_member_channel_id"`);

        await queryRunner.query(`ALTER TABLE "user_settings_protos" RENAME CONSTRAINT "FK_8ff3d1961a48b693810c9f99853" TO "FK_user_settings_proto_user_id"`);

        await queryRunner.query(`ALTER TABLE "users" RENAME CONSTRAINT "FK_0c14beb78d8c5ccba66072adbc7" TO "FK_user_settings_index"`);

        await queryRunner.query(`ALTER TABLE "voice_states" RENAME CONSTRAINT "FK_03779ef216d4b0358470d9cb748" TO "FK_voice_state_guild_id"`);
        await queryRunner.query(`ALTER TABLE "voice_states" RENAME CONSTRAINT "FK_5fe1d5f931a67e85039c640001b" TO "FK_voice_state_user_id"`);
        await queryRunner.query(`ALTER TABLE "voice_states" RENAME CONSTRAINT "FK_9f8d389866b40b6657edd026dd4" TO "FK_voice_state_channel_id"`);

        await queryRunner.query(`ALTER TABLE "webhooks" RENAME CONSTRAINT "FK_0d523f6f997c86e052c49b1455f" TO "FK_webhook_user_id"`);
        await queryRunner.query(`ALTER TABLE "webhooks" RENAME CONSTRAINT "FK_3a285f4f49c40e0706d3018bc9f" TO "FK_webhook_source_guild_id"`);
        await queryRunner.query(`ALTER TABLE "webhooks" RENAME CONSTRAINT "FK_4495b7032a33c6b8b605d030398" TO "FK_webhook_source_channel_id"`);
        await queryRunner.query(`ALTER TABLE "webhooks" RENAME CONSTRAINT "FK_487a7af59d189f744fe394368fc" TO "FK_webhook_guild_id"`);
        await queryRunner.query(`ALTER TABLE "webhooks" RENAME CONSTRAINT "FK_c3e5305461931763b56aa905f1c" TO "FK_webhook_application_id"`);
        await queryRunner.query(`ALTER TABLE "webhooks" RENAME CONSTRAINT "FK_df528cf77e82f8032230e7e37d8" TO "FK_webhook_channel_id"`);

        await queryRunner.query(`ALTER TABLE "backup_codes" RENAME CONSTRAINT "FK_70066ea80d2f4b871beda32633b" TO "FK_backup_code_user_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "instance_bans" RENAME CONSTRAINT "FK_origin_instance_ban_id" TO "FK_0b02d18d0d830f160c921192a30"`);

        await queryRunner.query(`ALTER TABLE "applications" RENAME CONSTRAINT "FK_application_bot_user_id" TO "FK_2ce5a55796fe4c2f77ece57a647"`);
        await queryRunner.query(`ALTER TABLE "applications" RENAME CONSTRAINT "FK_application_team_id" TO "FK_a36ed02953077f408d0f3ebc424"`);
        await queryRunner.query(`ALTER TABLE "applications" RENAME CONSTRAINT "FK_application_owner_id" TO "FK_e57508958bf92b9d9d25231b5e8"`);
        await queryRunner.query(`ALTER TABLE "applications" RENAME CONSTRAINT "FK_application_guild_id" TO "FK_e5bf78cdbbe9ba91062d74c5aba"`);

        await queryRunner.query(`ALTER TABLE "attachments" RENAME CONSTRAINT "FK_attachment_message_id" TO "FK_623e10eec51ada466c5038979e3"`);
        await queryRunner.query(`ALTER TABLE "attachments" RENAME CONSTRAINT "FK_attachment_channel_id" TO "attachments_channels_fk"`);

        await queryRunner.query(`ALTER TABLE "audit_logs" RENAME CONSTRAINT "FK_audit_log_target_user_id" TO "FK_3cd01cd3ae7aab010310d96ac8e"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" RENAME CONSTRAINT "FK_audit_log_source_user_id" TO "FK_bd2726fd31b35443f2245b93ba0"`);

        await queryRunner.query(`ALTER TABLE "automod_rules" RENAME CONSTRAINT "FK_automod_rule_creator_id" TO "FK_12d3d60b961393d310429c062b7"`);
        await queryRunner.query(`ALTER TABLE "automod_rules" RENAME CONSTRAINT "FK_automod_rule_guild_id" TO "automod_rules_guilds_fk"`);

        await queryRunner.query(`ALTER TABLE "bans" RENAME CONSTRAINT "FK_ban_executor_id" TO "FK_07ad88c86d1f290d46748410d58"`);
        await queryRunner.query(`ALTER TABLE "bans" RENAME CONSTRAINT "FK_ban_user_id" TO "FK_5999e8e449f80a236ff72023559"`);
        await queryRunner.query(`ALTER TABLE "bans" RENAME CONSTRAINT "FK_ban_guild_id" TO "FK_9d3ab7dd180ebdd245cdb66ecad"`);

        await queryRunner.query(`ALTER TABLE "channels" RENAME CONSTRAINT "FK_channel_parent_id" TO "FK_3274522d14af40540b1a883fc80"`);
        await queryRunner.query(`ALTER TABLE "channels" RENAME CONSTRAINT "FK_channel_owner_id" TO "FK_3873ed438575cce703ecff4fc7b"`);
        await queryRunner.query(`ALTER TABLE "channels" RENAME CONSTRAINT "FK_channel_guild_id" TO "FK_c253dafe5f3a03ec00cd8fb4581"`);

        await queryRunner.query(`ALTER TABLE "cloud_attachments" RENAME CONSTRAINT "FK_cloud_attachment_user_id" TO "FK_8bf8cc8767e48cb482ff644fce6"`);
        await queryRunner.query(`ALTER TABLE "cloud_attachments" RENAME CONSTRAINT "FK_cloud_attachment_channel_id" TO "FK_998d5fe91008ba5b09e1322104c"`);

        await queryRunner.query(`ALTER TABLE "connected_accounts" RENAME CONSTRAINT "FK_connected_account_user_id" TO "FK_f47244225a6a1eac04a3463dd90"`);

        await queryRunner.query(`ALTER TABLE "emojis" RENAME CONSTRAINT "FK_emoji_guild_id" TO "FK_4b988e0db89d94cebcf07f598cc"`);
        await queryRunner.query(`ALTER TABLE "emojis" RENAME CONSTRAINT "FK_emoji_user_id" TO "FK_fa7ddd5f9a214e28ce596548421"`);

        await queryRunner.query(`ALTER TABLE "guilds" RENAME CONSTRAINT "FK_guild_public_updates_channel_id" TO "FK_8d450b016dc8bec35f36729e4b0"`);
        await queryRunner.query(`ALTER TABLE "guilds" RENAME CONSTRAINT "FK_guild_rules_channel_id" TO "FK_95828668aa333460582e0ca6396"`);
        await queryRunner.query(`ALTER TABLE "guilds" RENAME CONSTRAINT "FK_guild_widget_channel_id" TO "FK_9d1d665379eefde7876a17afa99"`);
        await queryRunner.query(`ALTER TABLE "guilds" RENAME CONSTRAINT "FK_guild_system_channel_id" TO "FK_cfc3d3ad260f8121c95b31a1fce"`);
        await queryRunner.query(`ALTER TABLE "guilds" RENAME CONSTRAINT "FK_guild_template_id" TO "FK_e2a2f873a64a5cf62526de42325"`);
        await queryRunner.query(`ALTER TABLE "guilds" RENAME CONSTRAINT "FK_guild_afk_channel_id" TO "FK_f591a66b8019d87b0fe6c12dad6"`);
        await queryRunner.query(`ALTER TABLE "guilds" RENAME CONSTRAINT "FK_guild_owner_id" TO "FK_fc1a451727e3643ca572a3bb394"`);
        await queryRunner.query(`ALTER TABLE "guilds" RENAME CONSTRAINT "FK_guild_primary_category_id" TO "guilds_categories_fk"`);

        await queryRunner.query(`ALTER TABLE "invites" RENAME CONSTRAINT "FK_invite_target_user_id" TO "FK_11a0d394f8fc649c19ce5f16b59"`);
        await queryRunner.query(`ALTER TABLE "invites" RENAME CONSTRAINT "FK_invite_inviter_id" TO "FK_15c35422032e0b22b4ada95f48f"`);
        await queryRunner.query(`ALTER TABLE "invites" RENAME CONSTRAINT "FK_invite_guild_id" TO "FK_3f4939aa1461e8af57fea3fb05d"`);
        await queryRunner.query(`ALTER TABLE "invites" RENAME CONSTRAINT "FK_invite_channel_id" TO "FK_6a15b051fe5050aa00a4b9ff0f6"`);

        await queryRunner.query(`ALTER TABLE "member_roles" RENAME CONSTRAINT "FK_member_role_member_index" TO "FK_5d7ddc8a5f9c167f548625e772e"`);
        await queryRunner.query(`ALTER TABLE "member_roles" RENAME CONSTRAINT "FK_member_role_role_id" TO "FK_e9080e7a7997a0170026d5139c1"`);

        await queryRunner.query(`ALTER TABLE "members" RENAME CONSTRAINT "FK_member_guild_id" TO "FK_16aceddd5b89825b8ed6029ad1c"`);
        await queryRunner.query(`ALTER TABLE "members" RENAME CONSTRAINT "FK_member_user_id" TO "FK_28b53062261b996d9c99fa12404"`);

        await queryRunner.query(`ALTER TABLE "message_channel_mentions" RENAME CONSTRAINT "FK_message_channel_mention_message_id" TO "FK_2a27102ecd1d81b4582a4360921"`);
        await queryRunner.query(`ALTER TABLE "message_channel_mentions" RENAME CONSTRAINT "FK_message_channel_mention_channel_id" TO "FK_bdb8c09e1464cabf62105bf4b9d"`);

        await queryRunner.query(`ALTER TABLE "message_role_mentions" RENAME CONSTRAINT "FK_message_role_mention_message_id" TO "FK_a8242cf535337a490b0feaea0b4"`);
        await queryRunner.query(`ALTER TABLE "message_role_mentions" RENAME CONSTRAINT "FK_message_role_mention_role_id" TO "FK_29d63eb1a458200851bc37d074b"`);

        await queryRunner.query(`ALTER TABLE "message_stickers" RENAME CONSTRAINT "FK_message_stickers_message_id" TO "FK_40bb6f23e7cc133292e92829d28"`);
        await queryRunner.query(`ALTER TABLE "message_stickers" RENAME CONSTRAINT "FK_message_stickers_sticker_id" TO "FK_e22a70819d07659c7a71c112a1f"`);

        await queryRunner.query(`ALTER TABLE "message_user_mentions" RENAME CONSTRAINT "FK_message_user_mentions_message_id" TO "FK_a343387fc560ef378760681c236"`);
        await queryRunner.query(`ALTER TABLE "message_user_mentions" RENAME CONSTRAINT "FK_message_user_mentions_user_id" TO "FK_b831eb18ceebd28976239b1e2f8"`);

        await queryRunner.query(`ALTER TABLE "messages" RENAME CONSTRAINT "FK_message_author_id" TO "FK_05535bc695e9f7ee104616459d3"`);
        await queryRunner.query(`ALTER TABLE "messages" RENAME CONSTRAINT "FK_message_application_id" TO "FK_5d3ec1cb962de6488637fd779d6"`);
        await queryRunner.query(`ALTER TABLE "messages" RENAME CONSTRAINT "FK_message_message_reference_id" TO "FK_61a92bb65b302a76d9c1fcd3174"`);
        await queryRunner.query(`ALTER TABLE "messages" RENAME CONSTRAINT "FK_message_channel_id" TO "FK_86b9109b155eb70c0a2ca3b4b6d"`);
        await queryRunner.query(`ALTER TABLE "messages" RENAME CONSTRAINT "FK_message_member_id" TO "FK_b0525304f2262b7014245351c76"`);
        await queryRunner.query(`ALTER TABLE "messages" RENAME CONSTRAINT "FK_message_guild_id" TO "FK_b193588441b085352a4c0109423"`);
        await queryRunner.query(`ALTER TABLE "messages" RENAME CONSTRAINT "FK_message_thread_id" TO "FK_bb3af7f695d50083e6523290d41"`);
        await queryRunner.query(`ALTER TABLE "messages" RENAME CONSTRAINT "FK_message_webhook_id" TO "FK_f83c04bcf1df4e5c0e7a52ed348"`);

        await queryRunner.query(`ALTER TABLE "notes" RENAME CONSTRAINT "FK_note_target_id" TO "FK_23e08e5b4481711d573e1abecdc"`);
        await queryRunner.query(`ALTER TABLE "notes" RENAME CONSTRAINT "FK_note_owner_id" TO "FK_f9e103f8ae67cb1787063597925"`);

        await queryRunner.query(`ALTER TABLE "read_states" RENAME CONSTRAINT "FK_read_state_user_id" TO "FK_195f92e4dd1254a4e348c043763"`);
        await queryRunner.query(`ALTER TABLE "read_states" RENAME CONSTRAINT "FK_read_state_channel_id" TO "FK_40da2fca4e0eaf7a23b5bfc5d34"`);

        await queryRunner.query(`ALTER TABLE "recipients" RENAME CONSTRAINT "FK_recipient_channel_id" TO "FK_2f18ee1ba667f233ae86c0ea60e"`);
        await queryRunner.query(`ALTER TABLE "recipients" RENAME CONSTRAINT "FK_recipient_user_id" TO "FK_6157e8b6ba4e6e3089616481fe2"`);

        await queryRunner.query(`ALTER TABLE "relationships" RENAME CONSTRAINT "FK_relationship_from_id" TO "FK_9af4194bab1250b1c584ae4f1d7"`);
        await queryRunner.query(`ALTER TABLE "relationships" RENAME CONSTRAINT "FK_relationship_to_id" TO "FK_9c7f6b98a9843b76dce1b0c878b"`);

        await queryRunner.query(`ALTER TABLE "roles" RENAME CONSTRAINT "FK_role_guild_id" TO "FK_c32c1ab1c4dc7dcb0278c4b1b8b"`);

        await queryRunner.query(`ALTER TABLE "security_keys" RENAME CONSTRAINT "FK_security_key_user_id" TO "FK_24c97d0771cafedce6d7163eaad"`);

        await queryRunner.query(`ALTER TABLE "sessions" RENAME CONSTRAINT "FK_session_user_id" TO "FK_085d540d9f418cfbdc7bd55bb19"`);

        await queryRunner.query(`ALTER TABLE "sticker_packs" RENAME CONSTRAINT "FK_sticker_pack_cover_sticker_id" TO "FK_448fafba4355ee1c837bbc865f1"`);

        await queryRunner.query(`ALTER TABLE "stickers" RENAME CONSTRAINT "FK_sticker_guild_id" TO "FK_193d551d852aca5347ef5c9f205"`);
        await queryRunner.query(`ALTER TABLE "stickers" RENAME CONSTRAINT "FK_sticker_user_id" TO "FK_8f4ee73f2bb2325ff980502e158"`);
        await queryRunner.query(`ALTER TABLE "stickers" RENAME CONSTRAINT "FK_sticker_pack_id" TO "FK_e7cfa5cefa6661b3fb8fda8ce69"`);

        await queryRunner.query(`ALTER TABLE "stream_sessions" RENAME CONSTRAINT "FK_stream_session_user_id" TO "FK_13ae5c29aff4d0890c54179511a"`);
        await queryRunner.query(`ALTER TABLE "stream_sessions" RENAME CONSTRAINT "FK_stream_session_stream_id" TO "FK_8b5a028a34dae9ee54af37c9c32"`);

        await queryRunner.query(`ALTER TABLE "streams" RENAME CONSTRAINT "FK_stream_owner_id" TO "FK_1b566f9b54d1cda271da53ac82f"`);
        await queryRunner.query(`ALTER TABLE "streams" RENAME CONSTRAINT "FK_stream_channel_id" TO "FK_5101f0cded27ff0aae78fc4eed7"`);

        await queryRunner.query(`ALTER TABLE "tags" RENAME CONSTRAINT "FK_tag_channel_id" TO "FK_2e2df07f6dacc12e1932b361fe4"`);

        await queryRunner.query(`ALTER TABLE "team_members" RENAME CONSTRAINT "FK_team_member_user_id" TO "FK_c2bf4967c8c2a6b845dadfbf3d4"`);
        await queryRunner.query(`ALTER TABLE "team_members" RENAME CONSTRAINT "FK_team_member_team_id" TO "FK_fdad7d5768277e60c40e01cdcea"`);

        await queryRunner.query(`ALTER TABLE "teams" RENAME CONSTRAINT "FK_team_owner_user_id" TO "FK_13f00abf7cb6096c43ecaf8c108"`);

        await queryRunner.query(`ALTER TABLE "templates" RENAME CONSTRAINT "FK_template_source_guild_id" TO "FK_445d00eaaea0e60a017a5ed0c11"`);
        await queryRunner.query(`ALTER TABLE "templates" RENAME CONSTRAINT "FK_template_creator_id" TO "FK_d7374b7f8f5fbfdececa4fb62e1"`);

        await queryRunner.query(`ALTER TABLE "thread_members" RENAME CONSTRAINT "FK_thread_member_member_index" TO "FK_4721015b4e24ad29da55dbd2de0"`);
        await queryRunner.query(`ALTER TABLE "thread_members" RENAME CONSTRAINT "FK_thread_member_channel_id" TO "FK_cf20e37d71b0e1bf1ab633861c8"`);

        await queryRunner.query(`ALTER TABLE "user_settings_protos" RENAME CONSTRAINT "FK_user_settings_proto_user_id" TO "FK_8ff3d1961a48b693810c9f99853"`);

        await queryRunner.query(`ALTER TABLE "users" RENAME CONSTRAINT "FK_user_settings_index" TO "FK_0c14beb78d8c5ccba66072adbc7"`);

        await queryRunner.query(`ALTER TABLE "voice_states" RENAME CONSTRAINT "FK_voice_state_guild_id" TO "FK_03779ef216d4b0358470d9cb748"`);
        await queryRunner.query(`ALTER TABLE "voice_states" RENAME CONSTRAINT "FK_voice_state_user_id" TO "FK_5fe1d5f931a67e85039c640001b"`);
        await queryRunner.query(`ALTER TABLE "voice_states" RENAME CONSTRAINT "FK_voice_state_channel_id" TO "FK_9f8d389866b40b6657edd026dd4"`);

        await queryRunner.query(`ALTER TABLE "webhooks" RENAME CONSTRAINT "FK_webhook_user_id" TO "FK_0d523f6f997c86e052c49b1455f"`);
        await queryRunner.query(`ALTER TABLE "webhooks" RENAME CONSTRAINT "FK_webhook_source_guild_id" TO "FK_3a285f4f49c40e0706d3018bc9f"`);
        await queryRunner.query(`ALTER TABLE "webhooks" RENAME CONSTRAINT "FK_webhook_source_channel_id" TO "FK_4495b7032a33c6b8b605d030398"`);
        await queryRunner.query(`ALTER TABLE "webhooks" RENAME CONSTRAINT "FK_webhook_guild_id" TO "FK_487a7af59d189f744fe394368fc"`);
        await queryRunner.query(`ALTER TABLE "webhooks" RENAME CONSTRAINT "FK_webhook_application_id" TO "FK_c3e5305461931763b56aa905f1c"`);
        await queryRunner.query(`ALTER TABLE "webhooks" RENAME CONSTRAINT "FK_webhook_channel_id" TO "FK_df528cf77e82f8032230e7e37d8"`);

        await queryRunner.query(`ALTER TABLE "backup_codes" RENAME CONSTRAINT "FK_backup_code_user_id" TO "FK_70066ea80d2f4b871beda32633b"`);
    }
}
