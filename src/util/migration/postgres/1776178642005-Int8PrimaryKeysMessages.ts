import { MigrationInterface, QueryRunner } from "typeorm";

export class Int8PrimaryKeysMessages1776178642005 implements MigrationInterface {
    name = "Int8PrimaryKeysMessages1776178642005";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "int8");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "varchar");
    }

    private async convertPks(queryRunner: QueryRunner, to: string) {
        // messages
        // -> message_role_mentions
        await queryRunner.query(`ALTER TABLE message_role_mentions DROP CONSTRAINT "FK_a8242cf535337a490b0feaea0b4";`); //messagesId
        await queryRunner.query(`ALTER TABLE message_role_mentions ALTER COLUMN "messagesId" TYPE ${to} USING "messagesId"::${to}`);
        // -> message_channel_mentions
        await queryRunner.query(`ALTER TABLE message_channel_mentions DROP CONSTRAINT "FK_2a27102ecd1d81b4582a4360921";`); //messagesId
        await queryRunner.query(`ALTER TABLE message_channel_mentions ALTER COLUMN "messagesId" TYPE ${to} USING "messagesId"::${to}`);
        // -> message_user_mentions
        await queryRunner.query(`ALTER TABLE message_user_mentions DROP CONSTRAINT "FK_a343387fc560ef378760681c236";`); //messagesId
        await queryRunner.query(`ALTER TABLE message_user_mentions ALTER COLUMN "messagesId" TYPE ${to} USING "messagesId"::${to}`);
        // -> message_stickers
        await queryRunner.query(`ALTER TABLE message_stickers DROP CONSTRAINT "FK_40bb6f23e7cc133292e92829d28";`); //messagesId
        await queryRunner.query(`ALTER TABLE message_stickers ALTER COLUMN "messagesId" TYPE ${to} USING "messagesId"::${to}`);
        // -> attachments
        await queryRunner.query(`ALTER TABLE attachments DROP CONSTRAINT "FK_623e10eec51ada466c5038979e3";`); //message_id
        await queryRunner.query(`ALTER TABLE attachments ALTER COLUMN message_id TYPE ${to} USING message_id::${to}`);
        // -> messages
        await queryRunner.query(`ALTER TABLE messages DROP CONSTRAINT "FK_61a92bb65b302a76d9c1fcd3174";`); //message_reference_id
        await queryRunner.query(`ALTER TABLE messages ALTER COLUMN message_reference_id TYPE ${to} USING message_reference_id::${to}`);
        // and finally, cleanup
        await queryRunner.query(`ALTER TABLE messages ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(
            `ALTER TABLE message_role_mentions ADD CONSTRAINT "FK_a8242cf535337a490b0feaea0b4" FOREIGN KEY ("messagesId") REFERENCES messages(id) ON UPDATE CASCADE ON DELETE CASCADE;`,
        );
        await queryRunner.query(
            `ALTER TABLE message_channel_mentions ADD CONSTRAINT "FK_2a27102ecd1d81b4582a4360921" FOREIGN KEY ("messagesId") REFERENCES messages(id) ON UPDATE CASCADE ON DELETE CASCADE;`,
        );
        await queryRunner.query(
            `ALTER TABLE message_user_mentions ADD CONSTRAINT "FK_a343387fc560ef378760681c236" FOREIGN KEY ("messagesId") REFERENCES messages(id) ON UPDATE CASCADE ON DELETE CASCADE;`,
        );
        await queryRunner.query(
            `ALTER TABLE message_stickers ADD CONSTRAINT "FK_40bb6f23e7cc133292e92829d28" FOREIGN KEY ("messagesId") REFERENCES messages(id) ON UPDATE CASCADE ON DELETE CASCADE;`,
        );
        await queryRunner.query(`ALTER TABLE attachments ADD CONSTRAINT "FK_623e10eec51ada466c5038979e3" FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE;`);
        await queryRunner.query(
            `ALTER TABLE messages ADD CONSTRAINT "FK_61a92bb65b302a76d9c1fcd3174" FOREIGN KEY (message_reference_id) REFERENCES messages(id) ON DELETE SET NULL;`,
        );
    }
}
