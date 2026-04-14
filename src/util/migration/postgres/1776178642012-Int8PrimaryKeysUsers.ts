import { MigrationInterface, QueryRunner } from "typeorm";

export class Int8PrimaryKeysUsers1776178642012 implements MigrationInterface {
    name = "Int8PrimaryKeysUsers1776178642012";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "int8");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "varchar");
    }

    private async convertPks(queryRunner: QueryRunner, to: string) {
        // users
        // -> applications
        await queryRunner.query(`ALTER TABLE applications DROP CONSTRAINT "FK_2ce5a55796fe4c2f77ece57a647";`); //bot_user_id
        await queryRunner.query(`ALTER TABLE applications ALTER COLUMN bot_user_id TYPE ${to} USING bot_user_id::${to}`);
        await queryRunner.query(`ALTER TABLE applications DROP CONSTRAINT "FK_e57508958bf92b9d9d25231b5e8";`); //owner_id
        await queryRunner.query(`ALTER TABLE applications ALTER COLUMN owner_id TYPE ${to} USING owner_id::${to}`);
        // -> audit_logs
        await queryRunner.query(`ALTER TABLE audit_logs DROP CONSTRAINT "FK_3cd01cd3ae7aab010310d96ac8e";`); //target_id
        await queryRunner.query(`ALTER TABLE audit_logs ALTER COLUMN target_id TYPE ${to} USING target_id::${to}`);
        await queryRunner.query(`ALTER TABLE audit_logs DROP CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0";`); //user_id
        await queryRunner.query(`ALTER TABLE audit_logs ALTER COLUMN user_id TYPE ${to} USING user_id::${to}`);
        // -> automod_rules
        await queryRunner.query(`ALTER TABLE automod_rules DROP CONSTRAINT "FK_12d3d60b961393d310429c062b7";`); //creator_id
        await queryRunner.query(`ALTER TABLE automod_rules ALTER COLUMN creator_id TYPE ${to} USING creator_id::${to}`);
        // -> backup_codes
        await queryRunner.query(`ALTER TABLE backup_codes DROP CONSTRAINT "FK_70066ea80d2f4b871beda32633b";`); //user_id
        await queryRunner.query(`ALTER TABLE backup_codes ALTER COLUMN user_id TYPE ${to} USING user_id::${to}`);
        // -> bans
        await queryRunner.query(`ALTER TABLE bans DROP CONSTRAINT "FK_07ad88c86d1f290d46748410d58";`); //executor_id
        await queryRunner.query(`ALTER TABLE bans ALTER COLUMN executor_id TYPE ${to} USING executor_id::${to}`);
        await queryRunner.query(`ALTER TABLE bans DROP CONSTRAINT "FK_5999e8e449f80a236ff72023559";`); //user_id
        await queryRunner.query(`ALTER TABLE bans ALTER COLUMN user_id TYPE ${to} USING user_id::${to}`);
        // -> channels
        await queryRunner.query(`ALTER TABLE channels DROP CONSTRAINT "FK_3873ed438575cce703ecff4fc7b";`); //owner_id
        await queryRunner.query(`ALTER TABLE channels ALTER COLUMN owner_id TYPE ${to} USING owner_id::${to}`);
        // -> cloud_attachments
        await queryRunner.query(`ALTER TABLE cloud_attachments DROP CONSTRAINT "FK_8bf8cc8767e48cb482ff644fce6";`); //user_id
        await queryRunner.query(`ALTER TABLE cloud_attachments ALTER COLUMN user_id TYPE ${to} USING user_id::${to}`);
        // -> connected_accounts
        await queryRunner.query(`ALTER TABLE connected_accounts DROP CONSTRAINT "FK_f47244225a6a1eac04a3463dd90";`); //user_id
        await queryRunner.query(`ALTER TABLE connected_accounts ALTER COLUMN user_id TYPE ${to} USING user_id::${to}`);
        // -> emojis
        await queryRunner.query(`ALTER TABLE emojis DROP CONSTRAINT "FK_fa7ddd5f9a214e28ce596548421";`); //user_id
        await queryRunner.query(`ALTER TABLE emojis ALTER COLUMN user_id TYPE ${to} USING user_id::${to}`);
        // -> guilds
        await queryRunner.query(`ALTER TABLE guilds DROP CONSTRAINT "FK_fc1a451727e3643ca572a3bb394";`); //owner_id
        await queryRunner.query(`ALTER TABLE guilds ALTER COLUMN owner_id TYPE ${to} USING owner_id::${to}`);
        // -> invites
        await queryRunner.query(`ALTER TABLE invites DROP CONSTRAINT "FK_11a0d394f8fc649c19ce5f16b59";`); //target_user_id
        await queryRunner.query(`ALTER TABLE invites ALTER COLUMN target_user_id TYPE ${to} USING target_user_id::${to}`);
        await queryRunner.query(`ALTER TABLE invites DROP CONSTRAINT "FK_15c35422032e0b22b4ada95f48f";`); //inviter_id
        await queryRunner.query(`ALTER TABLE invites ALTER COLUMN inviter_id TYPE ${to} USING inviter_id::${to}`);
        // -> members
        await queryRunner.query(`ALTER TABLE members DROP CONSTRAINT "FK_28b53062261b996d9c99fa12404";`); //id
        await queryRunner.query(`ALTER TABLE members ALTER COLUMN id TYPE ${to} USING id::${to}`);
        // -> message_user_mentions
        await queryRunner.query(`ALTER TABLE message_user_mentions DROP CONSTRAINT "FK_b831eb18ceebd28976239b1e2f8";`); //usersId
        await queryRunner.query(`ALTER TABLE message_user_mentions ALTER COLUMN "usersId" TYPE ${to} USING "usersId"::${to}`);
        // -> messages
        await queryRunner.query(`ALTER TABLE messages DROP CONSTRAINT "FK_05535bc695e9f7ee104616459d3";`); //author_id
        await queryRunner.query(`ALTER TABLE messages ALTER COLUMN author_id TYPE ${to} USING author_id::${to}`);
        await queryRunner.query(`ALTER TABLE messages DROP CONSTRAINT "FK_b0525304f2262b7014245351c76";`); //member_id
        await queryRunner.query(`ALTER TABLE messages ALTER COLUMN member_id TYPE ${to} USING member_id::${to}`);
        // -> notes
        await queryRunner.query(`ALTER TABLE notes DROP CONSTRAINT "FK_23e08e5b4481711d573e1abecdc";`); //target_id
        await queryRunner.query(`ALTER TABLE notes ALTER COLUMN target_id TYPE ${to} USING target_id::${to}`);
        await queryRunner.query(`ALTER TABLE notes DROP CONSTRAINT "FK_f9e103f8ae67cb1787063597925";`); //owner_id
        await queryRunner.query(`ALTER TABLE notes ALTER COLUMN owner_id TYPE ${to} USING owner_id::${to}`);
        // -> read_states
        await queryRunner.query(`ALTER TABLE read_states DROP CONSTRAINT "FK_195f92e4dd1254a4e348c043763";`); //user_id
        await queryRunner.query(`ALTER TABLE read_states ALTER COLUMN user_id TYPE ${to} USING user_id::${to}`);
        // -> recipients
        await queryRunner.query(`ALTER TABLE recipients DROP CONSTRAINT "FK_6157e8b6ba4e6e3089616481fe2";`); //user_id
        await queryRunner.query(`ALTER TABLE recipients ALTER COLUMN user_id TYPE ${to} USING user_id::${to}`);
        // -> relationships
        await queryRunner.query(`ALTER TABLE relationships DROP CONSTRAINT "FK_9af4194bab1250b1c584ae4f1d7";`); //from_id
        await queryRunner.query(`ALTER TABLE relationships ALTER COLUMN from_id TYPE ${to} USING from_id::${to}`);
        await queryRunner.query(`ALTER TABLE relationships DROP CONSTRAINT "FK_9c7f6b98a9843b76dce1b0c878b";`); //to_id
        await queryRunner.query(`ALTER TABLE relationships ALTER COLUMN to_id TYPE ${to} USING to_id::${to}`);
        // -> security_keys
        await queryRunner.query(`ALTER TABLE security_keys DROP CONSTRAINT "FK_24c97d0771cafedce6d7163eaad";`); //user_id
        await queryRunner.query(`ALTER TABLE security_keys ALTER COLUMN user_id TYPE ${to} USING user_id::${to}`);
        // -> sessions
        await queryRunner.query(`ALTER TABLE sessions DROP CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19";`); //user_id
        await queryRunner.query(`ALTER TABLE sessions ALTER COLUMN user_id TYPE ${to} USING user_id::${to}`);
        // -> stickers
        await queryRunner.query(`ALTER TABLE stickers DROP CONSTRAINT "FK_8f4ee73f2bb2325ff980502e158";`); //user_id
        await queryRunner.query(`ALTER TABLE stickers ALTER COLUMN user_id TYPE ${to} USING user_id::${to}`);
        // -> stream_sessions
        await queryRunner.query(`ALTER TABLE stream_sessions DROP CONSTRAINT "FK_13ae5c29aff4d0890c54179511a";`); //user_id
        await queryRunner.query(`ALTER TABLE stream_sessions ALTER COLUMN user_id TYPE ${to} USING user_id::${to}`);
        // -> streams
        await queryRunner.query(`ALTER TABLE streams DROP CONSTRAINT "FK_1b566f9b54d1cda271da53ac82f";`); //owner_id
        await queryRunner.query(`ALTER TABLE streams ALTER COLUMN owner_id TYPE ${to} USING owner_id::${to}`);
        // -> team_members
        await queryRunner.query(`ALTER TABLE team_members DROP CONSTRAINT "FK_c2bf4967c8c2a6b845dadfbf3d4";`); //user_id
        await queryRunner.query(`ALTER TABLE team_members ALTER COLUMN user_id TYPE ${to} USING user_id::${to}`);
        // -> teams
        await queryRunner.query(`ALTER TABLE teams DROP CONSTRAINT "FK_13f00abf7cb6096c43ecaf8c108";`); //owner_user_id
        await queryRunner.query(`ALTER TABLE teams ALTER COLUMN owner_user_id TYPE ${to} USING owner_user_id::${to}`);
        // -> templates
        await queryRunner.query(`ALTER TABLE templates DROP CONSTRAINT "FK_d7374b7f8f5fbfdececa4fb62e1";`); //creator_id
        await queryRunner.query(`ALTER TABLE templates ALTER COLUMN creator_id TYPE ${to} USING creator_id::${to}`);
        // -> user_settings_protos
        await queryRunner.query(`ALTER TABLE user_settings_protos DROP CONSTRAINT "FK_8ff3d1961a48b693810c9f99853";`); //user_id
        await queryRunner.query(`ALTER TABLE user_settings_protos ALTER COLUMN user_id TYPE ${to} USING user_id::${to}`);
        // -> voice_states
        await queryRunner.query(`ALTER TABLE voice_states DROP CONSTRAINT "FK_5fe1d5f931a67e85039c640001b";`); //user_id
        await queryRunner.query(`ALTER TABLE voice_states ALTER COLUMN user_id TYPE ${to} USING user_id::${to}`);
        // -> webhooks
        await queryRunner.query(`ALTER TABLE webhooks DROP CONSTRAINT "FK_0d523f6f997c86e052c49b1455f";`); //user_id
        await queryRunner.query(`ALTER TABLE webhooks ALTER COLUMN user_id TYPE ${to} USING user_id::${to}`);
        // and finally, cleanup
        await queryRunner.query(`ALTER TABLE users ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(
            `ALTER TABLE public.applications ADD CONSTRAINT "FK_2ce5a55796fe4c2f77ece57a647" FOREIGN KEY (bot_user_id) REFERENCES users(id) ON DELETE CASCADE;`,
        );
        await queryRunner.query(`ALTER TABLE public.applications ADD CONSTRAINT "FK_e57508958bf92b9d9d25231b5e8" FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.audit_logs ADD CONSTRAINT "FK_3cd01cd3ae7aab010310d96ac8e" FOREIGN KEY (target_id) REFERENCES users(id);`);
        await queryRunner.query(`ALTER TABLE public.audit_logs ADD CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0" FOREIGN KEY (user_id) REFERENCES users(id);`);
        await queryRunner.query(
            `ALTER TABLE public.automod_rules ADD CONSTRAINT "FK_12d3d60b961393d310429c062b7" FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE;`,
        );
        await queryRunner.query(`ALTER TABLE public.backup_codes ADD CONSTRAINT "FK_70066ea80d2f4b871beda32633b" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.bans ADD CONSTRAINT "FK_07ad88c86d1f290d46748410d58" FOREIGN KEY (executor_id) REFERENCES users(id);`);
        await queryRunner.query(`ALTER TABLE public.bans ADD CONSTRAINT "FK_5999e8e449f80a236ff72023559" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.channels ADD CONSTRAINT "FK_3873ed438575cce703ecff4fc7b" FOREIGN KEY (owner_id) REFERENCES users(id);`);
        await queryRunner.query(
            `ALTER TABLE public.cloud_attachments ADD CONSTRAINT "FK_8bf8cc8767e48cb482ff644fce6" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;`,
        );
        await queryRunner.query(
            `ALTER TABLE public.connected_accounts ADD CONSTRAINT "FK_f47244225a6a1eac04a3463dd90" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`,
        );
        await queryRunner.query(`ALTER TABLE public.emojis ADD CONSTRAINT "FK_fa7ddd5f9a214e28ce596548421" FOREIGN KEY (user_id) REFERENCES users(id);`);
        await queryRunner.query(`ALTER TABLE public.guilds ADD CONSTRAINT "FK_fc1a451727e3643ca572a3bb394" FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.invites ADD CONSTRAINT "FK_11a0d394f8fc649c19ce5f16b59" FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.invites ADD CONSTRAINT "FK_15c35422032e0b22b4ada95f48f" FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.members ADD CONSTRAINT "FK_28b53062261b996d9c99fa12404" FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;`);
        await queryRunner.query(
            `ALTER TABLE public.message_user_mentions ADD CONSTRAINT "FK_b831eb18ceebd28976239b1e2f8" FOREIGN KEY ("usersId") REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;`,
        );
        await queryRunner.query(`ALTER TABLE public.messages ADD CONSTRAINT "FK_05535bc695e9f7ee104616459d3" FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.messages ADD CONSTRAINT "FK_b0525304f2262b7014245351c76" FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.notes ADD CONSTRAINT "FK_23e08e5b4481711d573e1abecdc" FOREIGN KEY (target_id) REFERENCES users(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.notes ADD CONSTRAINT "FK_f9e103f8ae67cb1787063597925" FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.read_states ADD CONSTRAINT "FK_195f92e4dd1254a4e348c043763" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.recipients ADD CONSTRAINT "FK_6157e8b6ba4e6e3089616481fe2" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.relationships ADD CONSTRAINT "FK_9af4194bab1250b1c584ae4f1d7" FOREIGN KEY (from_id) REFERENCES users(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.relationships ADD CONSTRAINT "FK_9c7f6b98a9843b76dce1b0c878b" FOREIGN KEY (to_id) REFERENCES users(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.security_keys ADD CONSTRAINT "FK_24c97d0771cafedce6d7163eaad" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.sessions ADD CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.stickers ADD CONSTRAINT "FK_8f4ee73f2bb2325ff980502e158" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.stream_sessions ADD CONSTRAINT "FK_13ae5c29aff4d0890c54179511a" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.streams ADD CONSTRAINT "FK_1b566f9b54d1cda271da53ac82f" FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.team_members ADD CONSTRAINT "FK_c2bf4967c8c2a6b845dadfbf3d4" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.teams ADD CONSTRAINT "FK_13f00abf7cb6096c43ecaf8c108" FOREIGN KEY (owner_user_id) REFERENCES users(id);`);
        await queryRunner.query(`ALTER TABLE public.templates ADD CONSTRAINT "FK_d7374b7f8f5fbfdececa4fb62e1" FOREIGN KEY (creator_id) REFERENCES users(id);`);
        await queryRunner.query(`ALTER TABLE public.user_settings_protos ADD CONSTRAINT "FK_8ff3d1961a48b693810c9f99853" FOREIGN KEY (user_id) REFERENCES users(id);`);
        await queryRunner.query(`ALTER TABLE public.voice_states ADD CONSTRAINT "FK_5fe1d5f931a67e85039c640001b" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.webhooks ADD CONSTRAINT "FK_0d523f6f997c86e052c49b1455f" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`);
    }
}
