import { MigrationInterface, QueryRunner } from "typeorm";

export class InstanceBanTable1765578570423 implements MigrationInterface {
    name = "InstanceBanTable1765578570423";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "instance_bans" ("id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "reason" character varying NOT NULL, "user_id" character varying, "fingerprint" character varying, "ip_address" character varying, "is_from_other_instance_ban" boolean NOT NULL DEFAULT false, "origin_instance_ban_id" character varying, CONSTRAINT "REL_0b02d18d0d830f160c921192a3" UNIQUE ("origin_instance_ban_id"), CONSTRAINT "PK_3aa6e80a6d325601054892b1340" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "instance_bans" ADD CONSTRAINT "FK_0b02d18d0d830f160c921192a30" FOREIGN KEY ("origin_instance_ban_id") REFERENCES "instance_bans"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "instance_bans" DROP CONSTRAINT "FK_0b02d18d0d830f160c921192a30"`);
        await queryRunner.query(`DROP TABLE "instance_bans"`);
    }
}
