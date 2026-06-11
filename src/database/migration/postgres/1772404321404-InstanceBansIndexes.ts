import { MigrationInterface, QueryRunner } from "typeorm";

export class InstanceBansIndexes1772404321404 implements MigrationInterface {
    name = "InstanceBansIndexes1772404321404";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX instance_bans_user_id_idx ON instance_bans USING HASH (user_id);`);
        await queryRunner.query(`CREATE INDEX instance_bans_fingerprint_idx ON instance_bans USING HASH (fingerprint);`);
        await queryRunner.query(`CREATE INDEX instance_bans_ip_address_idx ON instance_bans USING HASH (ip_address);`);
        // sneaky, sneaky maintenance
        await queryRunner.query(`REINDEX (VERBOSE) TABLE instance_bans;`);
        // escape the transaction for a sec...
        await queryRunner.query(`COMMIT;`);
        await queryRunner.query(`VACUUM (FULL, ANALYZE, VERBOSE) instance_bans;`);
        await queryRunner.query(`BEGIN;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX instance_bans_user_id_idx;`);
        await queryRunner.query(`DROP INDEX instance_bans_fingerprint_idx;`);
        await queryRunner.query(`DROP INDEX instance_bans_ip_address_idx;`);
    }
}
