import { MigrationInterface, QueryRunner } from "typeorm";

export class DontIpBanBanner1765143034407 implements MigrationInterface {
    name = 'DontIpBanBanner1765143034407'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bans" ALTER COLUMN "ip" DROP NOT NULL`);
		await queryRunner.query(`UPDATE "bans" SET "ip" = NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`UPDATE "bans" SET "ip" = '0.0.0.0' WHERE "ip" IS NULL`);
        await queryRunner.query(`ALTER TABLE "bans" ALTER COLUMN "ip" SET NOT NULL`);
    }

}
