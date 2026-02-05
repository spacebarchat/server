import { MigrationInterface, QueryRunner } from "typeorm";

export class ForumTags1770308886650 implements MigrationInterface {
    name = "ForumTags1770308886650";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "tags" ("id" character varying NOT NULL, "channel_id" character varying NOT NULL, "name" character varying NOT NULL, "moderated" boolean NOT NULL, "emoji_id" character varying NOT NULL, "emoji_name" character varying NOT NULL, CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(`ALTER TABLE "channels" ADD "applied_tags" text array`);
        await queryRunner.query(
            `ALTER TABLE "tags" ADD CONSTRAINT "FK_2e2df07f6dacc12e1932b361fe4" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tags" DROP CONSTRAINT "FK_2e2df07f6dacc12e1932b361fe4"`);
        await queryRunner.query(`ALTER TABLE "channels" DROP COLUMN "applied_tags"`);
        await queryRunner.query(`DROP TABLE "tags"`);
    }
}
