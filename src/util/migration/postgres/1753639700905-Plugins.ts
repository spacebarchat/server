import { MigrationInterface, QueryRunner } from "typeorm";

export class Plugins1753639700905 implements MigrationInterface {
    name = 'Plugins1753639700905'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "plugin_config" ("key" character varying NOT NULL, "value" text, CONSTRAINT "PK_aa929ece56c59233b85a16f62ef" PRIMARY KEY ("key"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "plugin_config"`);
    }

}
