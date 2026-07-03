import { MigrationInterface, QueryRunner } from "typeorm";

export class NameIndexes1782925307189 implements MigrationInterface {
    name = "NameIndexes1782925307189";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER INDEX "instance_bans_fingerprint_idx" RENAME TO "IDX_instance_ban_fingerprint"`);
        await queryRunner.query(`ALTER INDEX "instance_bans_ip_address_idx" RENAME TO "IDX_instance_ban_ip_address"`);
        await queryRunner.query(`ALTER INDEX "instance_bans_user_id_idx" RENAME TO "IDX_instance_ban_user_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER INDEX "IDX_instance_ban_fingerprint" RENAME TO "instance_bans_fingerprint_idx"`);
        await queryRunner.query(`ALTER INDEX "IDX_instance_ban_ip_address" RENAME TO "instance_bans_ip_address_idx"`);
        await queryRunner.query(`ALTER INDEX "IDX_instance_ban_user_id" RENAME TO "instance_bans_user_id_idx"`);
    }
}
