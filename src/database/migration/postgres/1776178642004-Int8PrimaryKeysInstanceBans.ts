import { MigrationInterface, QueryRunner } from "typeorm";

export class Int8PrimaryKeysInstanceBans1776178642004 implements MigrationInterface {
    name = "Int8PrimaryKeysInstanceBans1776178642004";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "int8");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "varchar");
    }

    private async convertPks(queryRunner: QueryRunner, to: string) {
        // instance_bans
        // -> instance_bans
        await queryRunner.query(`ALTER TABLE instance_bans DROP CONSTRAINT "FK_0b02d18d0d830f160c921192a30";`); //origin_instance_ban_id
        await queryRunner.query(`ALTER TABLE instance_bans ALTER COLUMN origin_instance_ban_id TYPE ${to} USING origin_instance_ban_id::${to}`);
        // and finally, cleanup
        await queryRunner.query(`ALTER TABLE instance_bans ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(
            `ALTER TABLE instance_bans ADD CONSTRAINT "FK_0b02d18d0d830f160c921192a30" FOREIGN KEY (origin_instance_ban_id) REFERENCES instance_bans(id) ON DELETE SET NULL;`,
        );
    }
}
