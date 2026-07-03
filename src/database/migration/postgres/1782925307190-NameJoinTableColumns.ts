import { MigrationInterface, QueryRunner } from "typeorm";

export class NameJoinTableColumns1782925307190 implements MigrationInterface {
    name = "NameJoinTableColumns1782925307190";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE message_channel_mentions RENAME COLUMN "messagesId" TO "message_id"`);
        await queryRunner.query(`ALTER TABLE message_channel_mentions RENAME COLUMN "channelsId" TO "channel_id"`);

        await queryRunner.query(`ALTER TABLE message_role_mentions RENAME COLUMN "messagesId" TO "message_id"`);
        await queryRunner.query(`ALTER TABLE message_role_mentions RENAME COLUMN "rolesId" TO "role_id"`);

        await queryRunner.query(`ALTER TABLE message_stickers RENAME COLUMN "messagesId" TO "message_id"`);
        await queryRunner.query(`ALTER TABLE message_stickers RENAME COLUMN "stickersId" TO "sticker_id"`);

        await queryRunner.query(`ALTER TABLE message_user_mentions RENAME COLUMN "messagesId" TO "message_id"`);
        await queryRunner.query(`ALTER TABLE message_user_mentions RENAME COLUMN "usersId" TO "user_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE message_channel_mentions RENAME COLUMN "message_id" TO "messagesId"`);
        await queryRunner.query(`ALTER TABLE message_channel_mentions RENAME COLUMN "channel_id" TO "channelsId"`);

        await queryRunner.query(`ALTER TABLE message_role_mentions RENAME COLUMN "message_id" TO "messagesId"`);
        await queryRunner.query(`ALTER TABLE message_role_mentions RENAME COLUMN "role_id" TO "rolesId"`);

        await queryRunner.query(`ALTER TABLE message_stickers RENAME COLUMN "message_id" TO "messagesId"`);
        await queryRunner.query(`ALTER TABLE message_stickers RENAME COLUMN "sticker_id" TO "stickersId"`);

        await queryRunner.query(`ALTER TABLE message_user_mentions RENAME COLUMN "message_id" TO "messagesId"`);
        await queryRunner.query(`ALTER TABLE message_user_mentions RENAME COLUMN "user_id" TO "usersId"`);
    }
}
