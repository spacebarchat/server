import { MigrationInterface, QueryRunner } from "typeorm";

export class InstanceBanAllowlist1765587835846 implements MigrationInterface {
    name = "InstanceBanAllowlist1765587835846";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "instance_bans" ADD "is_allowlisted" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "instance_bans" DROP COLUMN "is_allowlisted"`);
    }
}
