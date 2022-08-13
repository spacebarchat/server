import { MigrationInterface, QueryRunner } from "typeorm";

export class InvitersAreDeletable1660416055566 implements MigrationInterface {
    name = 'InvitersAreDeletable1660416055566'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "invites" DROP CONSTRAINT "FK_15c35422032e0b22b4ada95f48f"
        `);
        await queryRunner.query(`
            ALTER TABLE "invites"
            ADD CONSTRAINT "FK_15c35422032e0b22b4ada95f48f" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "invites" DROP CONSTRAINT "FK_15c35422032e0b22b4ada95f48f"
        `);
        await queryRunner.query(`
            ALTER TABLE "invites"
            ADD CONSTRAINT "FK_15c35422032e0b22b4ada95f48f" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
