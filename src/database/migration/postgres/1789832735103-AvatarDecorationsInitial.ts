import { MigrationInterface, QueryRunner } from "typeorm";

export class AvatarDecorationsInitial1789832735103 implements MigrationInterface {
    name = "AvatarDecorationsInitial1789832735103";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_user_settings_index"`);
        await queryRunner.query(
            `CREATE TABLE "avatar_decorations" ("id" bigint NOT NULL, "asset" character varying NOT NULL, "approved" boolean NOT NULL DEFAULT false, "uploader_id" bigint, "public" boolean NOT NULL DEFAULT false, "allowed_user_ids" bigint array NOT NULL, "allowed_guild_ids" bigint array NOT NULL, "allowed_role_ids" bigint array NOT NULL, CONSTRAINT "PK_17e3f1b6431fe3f3eca9916f3f6" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(`CREATE INDEX "IDX_avatar_decoration_uploader_id" ON "avatar_decorations"  ("uploader_id") `);
        await queryRunner.query(
            `ALTER TABLE "avatar_decorations" ADD CONSTRAINT "FK_avatar_decoration_uploader_id" FOREIGN KEY ("uploader_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "avatar_decorations" DROP CONSTRAINT "FK_avatar_decoration_uploader_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_avatar_decoration_uploader_id"`);
        await queryRunner.query(`DROP TABLE "avatar_decorations"`);
    }
}
