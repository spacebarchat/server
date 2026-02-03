import { MigrationInterface, QueryRunner } from "typeorm";

export class MemberProfileCustomisation1770079838835 implements MigrationInterface {
    name = "MemberProfileCustomisation1770079838835";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // just gonna let typeorm do its thing for once...
        await queryRunner.query(`ALTER TABLE "thread_members" DROP CONSTRAINT "FK_606ac45e8756d3440c584477f4e"`);
        try {
            await queryRunner.query(`ALTER TABLE "webhooks" DROP CONSTRAINT "fk_d64f38834fa676f6caa4786ddd6"`);
        } catch {
            /* empty */
        }
        await queryRunner.query(`DROP INDEX "public"."IDX_bde0970b6a26bdbd83508addd2"`);
        await queryRunner.query(`ALTER TABLE "members" ADD "avatar_decoration_data" text`);
        await queryRunner.query(`ALTER TABLE "members" ADD "display_name_styles" text`);
        await queryRunner.query(`ALTER TABLE "members" ADD "collectibles" text`);
        await queryRunner.query(`ALTER TABLE "guilds" ALTER COLUMN "channel_ordering" DROP DEFAULT`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_38d4f704373da3f0dc9b352ac9" ON "thread_members" ("id", "member_idx") `);
        await queryRunner.query(
            `ALTER TABLE "thread_members" ADD CONSTRAINT "FK_4721015b4e24ad29da55dbd2de0" FOREIGN KEY ("member_idx") REFERENCES "members"("index") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "thread_members" DROP CONSTRAINT "FK_4721015b4e24ad29da55dbd2de0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_38d4f704373da3f0dc9b352ac9"`);
        await queryRunner.query(`ALTER TABLE "guilds" ALTER COLUMN "channel_ordering" SET DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "collectibles"`);
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "display_name_styles"`);
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "avatar_decoration_data"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_bde0970b6a26bdbd83508addd2" ON "thread_members" ("id", "member_idx") `);
        await queryRunner.query(
            `ALTER TABLE "thread_members" ADD CONSTRAINT "FK_606ac45e8756d3440c584477f4e" FOREIGN KEY ("member_idx") REFERENCES "members"("index") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }
}
