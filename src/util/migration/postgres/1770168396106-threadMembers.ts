import { MigrationInterface, QueryRunner } from "typeorm";

export class ThreadMembers1770168396106 implements MigrationInterface {
    name = "ThreadMembers1770168396106";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_38d4f704373da3f0dc9b352acs9" ON "thread_members" ("id", "member_idx") `);
        await queryRunner.query(
            `ALTER TABLE "thread_members" ADD CONSTRAINT "FK_4721015b4e24ad29da55dbd2de0" FOREIGN KEY ("member_idx") REFERENCES "members"("index") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "thread_members" DROP CONSTRAINT "FK_4721015b4e24ad29da55dbd2de0"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_bde0970b6a26bdbd83508addd2" ON "thread_members" ("id", "member_idx") `);
    }
}
