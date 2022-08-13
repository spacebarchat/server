import { MigrationInterface, QueryRunner } from "typeorm";

export class PluginConfigs1660404579644 implements MigrationInterface {
    name = 'PluginConfigs1660404579644'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "plugin_config" ("key" varchar PRIMARY KEY NOT NULL, "value" text)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "plugin_config"
        `);
    }

}
