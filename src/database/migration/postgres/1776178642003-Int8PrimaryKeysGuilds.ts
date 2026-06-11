import { MigrationInterface, QueryRunner } from "typeorm";

export class Int8PrimaryKeysGuilds1776178642003 implements MigrationInterface {
    name = "Int8PrimaryKeysGuilds1776178642003";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "int8");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "varchar");
    }

    private async convertPks(queryRunner: QueryRunner, to: string) {
        // guilds
        // -> applications
        await queryRunner.query(`ALTER TABLE applications DROP CONSTRAINT "FK_e5bf78cdbbe9ba91062d74c5aba";`); //guild_id
        await queryRunner.query(`ALTER TABLE applications ALTER COLUMN guild_id TYPE ${to} USING guild_id::${to}`);
        // -> bans
        await queryRunner.query(`ALTER TABLE bans DROP CONSTRAINT "FK_9d3ab7dd180ebdd245cdb66ecad";`); //guild_id
        await queryRunner.query(`ALTER TABLE bans ALTER COLUMN guild_id TYPE ${to} USING guild_id::${to}`);
        // -> channels
        await queryRunner.query(`ALTER TABLE channels DROP CONSTRAINT "FK_c253dafe5f3a03ec00cd8fb4581";`); //guild_id
        await queryRunner.query(`ALTER TABLE channels ALTER COLUMN guild_id TYPE ${to} USING guild_id::${to}`);
        // -> emojis
        await queryRunner.query(`ALTER TABLE emojis DROP CONSTRAINT "FK_4b988e0db89d94cebcf07f598cc";`); //guild_id
        await queryRunner.query(`ALTER TABLE emojis ALTER COLUMN guild_id TYPE ${to} USING guild_id::${to}`);
        // -> invites
        await queryRunner.query(`ALTER TABLE invites DROP CONSTRAINT "FK_3f4939aa1461e8af57fea3fb05d";`); //guild_id
        await queryRunner.query(`ALTER TABLE invites ALTER COLUMN guild_id TYPE ${to} USING guild_id::${to}`);
        // -> members
        await queryRunner.query(`ALTER TABLE members DROP CONSTRAINT "FK_16aceddd5b89825b8ed6029ad1c";`); //guild_id
        await queryRunner.query(`ALTER TABLE members ALTER COLUMN guild_id TYPE ${to} USING guild_id::${to}`);
        // -> messages
        await queryRunner.query(`ALTER TABLE messages DROP CONSTRAINT "FK_b193588441b085352a4c0109423";`); //guild_id
        await queryRunner.query(`ALTER TABLE messages ALTER COLUMN guild_id TYPE ${to} USING guild_id::${to}`);
        // -> roles
        await queryRunner.query(`ALTER TABLE roles DROP CONSTRAINT "FK_c32c1ab1c4dc7dcb0278c4b1b8b";`); //guild_id
        await queryRunner.query(`ALTER TABLE roles ALTER COLUMN guild_id TYPE ${to} USING guild_id::${to}`);
        // -> stickers
        await queryRunner.query(`ALTER TABLE stickers DROP CONSTRAINT "FK_193d551d852aca5347ef5c9f205";`); //guild_id
        await queryRunner.query(`ALTER TABLE stickers ALTER COLUMN guild_id TYPE ${to} USING guild_id::${to}`);
        // -> templates
        await queryRunner.query(`ALTER TABLE templates DROP CONSTRAINT "FK_445d00eaaea0e60a017a5ed0c11";`); //source_guild_id
        await queryRunner.query(`ALTER TABLE templates ALTER COLUMN source_guild_id TYPE ${to} USING source_guild_id::${to}`);
        // -> voice_states
        await queryRunner.query(`ALTER TABLE voice_states DROP CONSTRAINT "FK_03779ef216d4b0358470d9cb748";`); //guild_id
        await queryRunner.query(`ALTER TABLE voice_states ALTER COLUMN guild_id TYPE ${to} USING guild_id::${to}`);
        // -> webhooks
        await queryRunner.query(`ALTER TABLE webhooks DROP CONSTRAINT "FK_3a285f4f49c40e0706d3018bc9f";`); //source_guild_id
        await queryRunner.query(`ALTER TABLE webhooks ALTER COLUMN source_guild_id TYPE ${to} USING source_guild_id::${to}`);
        await queryRunner.query(`ALTER TABLE webhooks DROP CONSTRAINT "FK_487a7af59d189f744fe394368fc";`); //guild_id
        await queryRunner.query(`ALTER TABLE webhooks ALTER COLUMN guild_id TYPE ${to} USING guild_id::${to}`);
        // and finally, cleanup
        await queryRunner.query(`ALTER TABLE guilds ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(`ALTER TABLE public.messages ADD CONSTRAINT "FK_b193588441b085352a4c0109423" FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.invites ADD CONSTRAINT "FK_3f4939aa1461e8af57fea3fb05d" FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE;`);
        await queryRunner.query(
            `ALTER TABLE public.templates ADD CONSTRAINT "FK_445d00eaaea0e60a017a5ed0c11" FOREIGN KEY (source_guild_id) REFERENCES guilds(id) ON DELETE CASCADE;`,
        );
        await queryRunner.query(
            `ALTER TABLE public.webhooks ADD CONSTRAINT "FK_3a285f4f49c40e0706d3018bc9f" FOREIGN KEY (source_guild_id) REFERENCES guilds(id) ON DELETE CASCADE;`,
        );
        await queryRunner.query(`ALTER TABLE public.webhooks ADD CONSTRAINT "FK_487a7af59d189f744fe394368fc" FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.members ADD CONSTRAINT "FK_16aceddd5b89825b8ed6029ad1c" FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.roles ADD CONSTRAINT "FK_c32c1ab1c4dc7dcb0278c4b1b8b" FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.stickers ADD CONSTRAINT "FK_193d551d852aca5347ef5c9f205" FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.applications ADD CONSTRAINT "FK_e5bf78cdbbe9ba91062d74c5aba" FOREIGN KEY (guild_id) REFERENCES guilds(id);`);
        await queryRunner.query(`ALTER TABLE public.voice_states ADD CONSTRAINT "FK_03779ef216d4b0358470d9cb748" FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.bans ADD CONSTRAINT "FK_9d3ab7dd180ebdd245cdb66ecad" FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.emojis ADD CONSTRAINT "FK_4b988e0db89d94cebcf07f598cc" FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.channels ADD CONSTRAINT "FK_c253dafe5f3a03ec00cd8fb4581" FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE;`);
    }
}
