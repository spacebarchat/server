import { MigrationInterface, QueryRunner } from "typeorm";

export class MessageFlagsNotNull1713116476900 implements MigrationInterface {
    name = "MessageFlagsNotNull1713116476900";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE messages RENAME COLUMN flags TO flags_old;");
        await queryRunner.query("ALTER TABLE messages ADD COLUMN flags integer NOT NULL DEFAULT 0;");
        await queryRunner.query("UPDATE messages SET flags = COALESCE(flags_old, 0);");
        await queryRunner.query("ALTER TABLE messages DROP COLUMN flags_old;");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE messages RENAME COLUMN flags TO flags_new;");
        await queryRunner.query("ALTER TABLE messages ADD COLUMN flags integer;");
        await queryRunner.query("UPDATE messages SET flags = flags_new;");
        await queryRunner.query("ALTER TABLE messages DROP COLUMN flags_new;");
    }
}
