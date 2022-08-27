import { MigrationInterface, QueryRunner } from "typeorm";

export class PluginConfigs1660404644371 implements MigrationInterface {
	name = "PluginConfigs1660404644371";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            DROP INDEX \`IDX_76ba283779c8441fd5ff819c8c\` ON \`users\`
        `);
		await queryRunner.query(`
            CREATE TABLE \`plugin_config\` (
                \`key\` varchar(255) NOT NULL,
                \`value\` text NULL,
                PRIMARY KEY (\`key\`)
            ) ENGINE = InnoDB
        `);
		await queryRunner.query(`
            ALTER TABLE \`channels\`
            ADD \`flags\` int NULL
        `);
		await queryRunner.query(`
            ALTER TABLE \`channels\`
            ADD \`default_thread_rate_limit_per_user\` int NULL
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE \`channels\` DROP COLUMN \`default_thread_rate_limit_per_user\`
        `);
		await queryRunner.query(`
            ALTER TABLE \`channels\` DROP COLUMN \`flags\`
        `);
		await queryRunner.query(`
            DROP TABLE \`plugin_config\`
        `);
		await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_76ba283779c8441fd5ff819c8c\` ON \`users\` (\`settingsId\`)
        `);
	}
}
