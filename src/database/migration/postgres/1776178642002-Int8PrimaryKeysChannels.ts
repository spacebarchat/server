import { MigrationInterface, QueryRunner } from "typeorm";

export class Int8PrimaryKeysChannels1776178642002 implements MigrationInterface {
    name = "Int8PrimaryKeysChannels1776178642002";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "int8");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "varchar");
    }

    private async convertPks(queryRunner: QueryRunner, to: string) {
        // channels
        // -> channels
        await queryRunner.query(`ALTER TABLE channels DROP CONSTRAINT "FK_3274522d14af40540b1a883fc80";`); //parent_id
        await queryRunner.query(`ALTER TABLE channels ALTER COLUMN parent_id TYPE ${to} USING parent_id::${to}`);
        // -> cloud_attachments
        await queryRunner.query(`ALTER TABLE cloud_attachments DROP CONSTRAINT "FK_998d5fe91008ba5b09e1322104c";`); //channel_id
        await queryRunner.query(`ALTER TABLE cloud_attachments ALTER COLUMN channel_id TYPE ${to} USING channel_id::${to}`);
        // -> guilds
        await queryRunner.query(`ALTER TABLE guilds DROP CONSTRAINT "FK_8d450b016dc8bec35f36729e4b0";`); //public_updates_channel_id
        await queryRunner.query(`ALTER TABLE guilds ALTER COLUMN public_updates_channel_id TYPE ${to} USING public_updates_channel_id::${to}`);
        await queryRunner.query(`ALTER TABLE guilds DROP CONSTRAINT "FK_95828668aa333460582e0ca6396";`); //rules_channel_id
        await queryRunner.query(`ALTER TABLE guilds ALTER COLUMN rules_channel_id TYPE ${to} USING rules_channel_id::${to}`);
        await queryRunner.query(`ALTER TABLE guilds DROP CONSTRAINT "FK_9d1d665379eefde7876a17afa99";`); //widget_channel_id
        await queryRunner.query(`ALTER TABLE guilds ALTER COLUMN widget_channel_id TYPE ${to} USING widget_channel_id::${to}`);
        await queryRunner.query(`ALTER TABLE guilds DROP CONSTRAINT "FK_cfc3d3ad260f8121c95b31a1fce";`); //system_channel_id
        await queryRunner.query(`ALTER TABLE guilds ALTER COLUMN system_channel_id TYPE ${to} USING system_channel_id::${to}`);
        await queryRunner.query(`ALTER TABLE guilds DROP CONSTRAINT "FK_f591a66b8019d87b0fe6c12dad6";`); //afk_channel_id
        await queryRunner.query(`ALTER TABLE guilds ALTER COLUMN afk_channel_id TYPE ${to} USING afk_channel_id::${to}`);
        // -> invites
        await queryRunner.query(`ALTER TABLE invites DROP CONSTRAINT "FK_6a15b051fe5050aa00a4b9ff0f6";`); //channel_id
        await queryRunner.query(`ALTER TABLE invites ALTER COLUMN channel_id TYPE ${to} USING channel_id::${to}`);
        // -> message_channel_mentions
        await queryRunner.query(`ALTER TABLE message_channel_mentions DROP CONSTRAINT "FK_bdb8c09e1464cabf62105bf4b9d";`); //channelsId
        await queryRunner.query(`ALTER TABLE message_channel_mentions ALTER COLUMN "channelsId" TYPE ${to} USING "channelsId"::${to}`);
        // -> messages
        await queryRunner.query(`ALTER TABLE messages DROP CONSTRAINT "FK_86b9109b155eb70c0a2ca3b4b6d";`); //channel_id
        await queryRunner.query(`ALTER TABLE messages ALTER COLUMN "channel_id" TYPE ${to} USING "channel_id"::${to}`);
        await queryRunner.query(`ALTER TABLE messages DROP CONSTRAINT "FK_bb3af7f695d50083e6523290d41";`); //thread_id
        await queryRunner.query(`ALTER TABLE messages ALTER COLUMN "thread_id" TYPE ${to} USING "thread_id"::${to}`);
        // -> read_states
        await queryRunner.query(`ALTER TABLE read_states DROP CONSTRAINT "FK_40da2fca4e0eaf7a23b5bfc5d34";`); //channel_id
        await queryRunner.query(`ALTER TABLE read_states ALTER COLUMN "channel_id" TYPE ${to} USING "channel_id"::${to}`);
        // -> recipients
        await queryRunner.query(`ALTER TABLE recipients DROP CONSTRAINT "FK_2f18ee1ba667f233ae86c0ea60e";`); //channel_id
        await queryRunner.query(`ALTER TABLE recipients ALTER COLUMN "channel_id" TYPE ${to} USING "channel_id"::${to}`);
        // -> streams
        await queryRunner.query(`ALTER TABLE streams DROP CONSTRAINT "FK_5101f0cded27ff0aae78fc4eed7";`); //channel_id
        await queryRunner.query(`ALTER TABLE streams ALTER COLUMN "channel_id" TYPE ${to} USING "channel_id"::${to}`);
        // -> tags
        await queryRunner.query(`ALTER TABLE tags DROP CONSTRAINT "FK_2e2df07f6dacc12e1932b361fe4";`); //channel_id
        await queryRunner.query(`ALTER TABLE tags ALTER COLUMN "channel_id" TYPE ${to} USING "channel_id"::${to}`);
        // -> thread_members
        await queryRunner.query(`ALTER TABLE thread_members DROP CONSTRAINT "FK_cf20e37d71b0e1bf1ab633861c8";`); //id
        await queryRunner.query(`ALTER TABLE thread_members ALTER COLUMN "id" TYPE ${to} USING "id"::${to}`);
        // -> voice_states
        await queryRunner.query(`ALTER TABLE voice_states DROP CONSTRAINT "FK_9f8d389866b40b6657edd026dd4";`); //channel_id
        await queryRunner.query(`ALTER TABLE voice_states ALTER COLUMN "channel_id" TYPE ${to} USING "channel_id"::${to}`);
        // -> webhooks
        await queryRunner.query(`ALTER TABLE webhooks DROP CONSTRAINT "FK_4495b7032a33c6b8b605d030398";`); //source_channel_id
        await queryRunner.query(`ALTER TABLE webhooks ALTER COLUMN "source_channel_id" TYPE ${to} USING "source_channel_id"::${to}`);
        await queryRunner.query(`ALTER TABLE webhooks DROP CONSTRAINT "FK_df528cf77e82f8032230e7e37d8";`); //channel_id
        await queryRunner.query(`ALTER TABLE webhooks ALTER COLUMN "channel_id" TYPE ${to} USING "channel_id"::${to}`);
        // and finally, cleanup
        await queryRunner.query(`ALTER TABLE channels ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(`ALTER TABLE channels ADD CONSTRAINT "FK_3274522d14af40540b1a883fc80" FOREIGN KEY (parent_id) REFERENCES channels(id);`);
        await queryRunner.query(
            `ALTER TABLE cloud_attachments ADD CONSTRAINT "FK_998d5fe91008ba5b09e1322104c" FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE SET NULL;`,
        );
        await queryRunner.query(`ALTER TABLE guilds ADD CONSTRAINT "FK_8d450b016dc8bec35f36729e4b0" FOREIGN KEY (public_updates_channel_id) REFERENCES channels(id);`);
        await queryRunner.query(`ALTER TABLE guilds ADD CONSTRAINT "FK_95828668aa333460582e0ca6396" FOREIGN KEY (rules_channel_id) REFERENCES channels(id);`);
        await queryRunner.query(`ALTER TABLE guilds ADD CONSTRAINT "FK_9d1d665379eefde7876a17afa99" FOREIGN KEY (widget_channel_id) REFERENCES channels(id);`);
        await queryRunner.query(`ALTER TABLE guilds ADD CONSTRAINT "FK_cfc3d3ad260f8121c95b31a1fce" FOREIGN KEY (system_channel_id) REFERENCES channels(id);`);
        await queryRunner.query(`ALTER TABLE guilds ADD CONSTRAINT "FK_f591a66b8019d87b0fe6c12dad6" FOREIGN KEY (afk_channel_id) REFERENCES channels(id);`);
        await queryRunner.query(`ALTER TABLE invites ADD CONSTRAINT "FK_6a15b051fe5050aa00a4b9ff0f6" FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE;`);
        await queryRunner.query(
            `ALTER TABLE message_channel_mentions ADD CONSTRAINT "FK_bdb8c09e1464cabf62105bf4b9d" FOREIGN KEY ("channelsId") REFERENCES channels(id) ON UPDATE CASCADE ON DELETE CASCADE;`,
        );
        await queryRunner.query(`ALTER TABLE messages ADD CONSTRAINT "FK_86b9109b155eb70c0a2ca3b4b6d" FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE messages ADD CONSTRAINT "FK_bb3af7f695d50083e6523290d41" FOREIGN KEY (thread_id) REFERENCES channels(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE read_states ADD CONSTRAINT "FK_40da2fca4e0eaf7a23b5bfc5d34" FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE recipients ADD CONSTRAINT "FK_2f18ee1ba667f233ae86c0ea60e" FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE streams ADD CONSTRAINT "FK_5101f0cded27ff0aae78fc4eed7" FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE tags ADD CONSTRAINT "FK_2e2df07f6dacc12e1932b361fe4" FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE thread_members ADD CONSTRAINT "FK_cf20e37d71b0e1bf1ab633861c8" FOREIGN KEY (id) REFERENCES channels(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE voice_states ADD CONSTRAINT "FK_9f8d389866b40b6657edd026dd4" FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE webhooks ADD CONSTRAINT "FK_4495b7032a33c6b8b605d030398" FOREIGN KEY (source_channel_id) REFERENCES channels(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE webhooks ADD CONSTRAINT "FK_df528cf77e82f8032230e7e37d8" FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE;`);
    }
}
