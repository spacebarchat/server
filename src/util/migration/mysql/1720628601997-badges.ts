import { MigrationInterface, QueryRunner } from "typeorm";

export class Badges1720628601997 implements MigrationInterface {
	name = "Badges1720628601997";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE \`badges\` (\`id\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`icon\` varchar(255) NOT NULL, \`link\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
		);
		await queryRunner.query(
			`ALTER TABLE \`users\` ADD \`badge_ids\` text NULL`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE \`users\` DROP COLUMN \`badge_ids\``,
		);
		await queryRunner.query(`DROP TABLE \`badges\``);
	}
}
