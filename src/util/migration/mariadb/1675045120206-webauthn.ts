import { MigrationInterface, QueryRunner } from "typeorm";

export class webauthn1675045120206 implements MigrationInterface {
	name = "webauthn1675045120206";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE \`security_keys\` (\`id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NULL, \`key_id\` varchar(255) NOT NULL, \`public_key\` varchar(255) NOT NULL, \`counter\` int NOT NULL, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
		);
		await queryRunner.query(
			`ALTER TABLE \`users\` ADD \`webauthn_enabled\` tinyint NOT NULL DEFAULT 0`,
		);
		await queryRunner.query(
			`ALTER TABLE \`security_keys\` ADD CONSTRAINT \`FK_24c97d0771cafedce6d7163eaad\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE \`security_keys\` DROP FOREIGN KEY \`FK_24c97d0771cafedce6d7163eaad\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`users\` DROP COLUMN \`webauthn_enabled\``,
		);
		await queryRunner.query(`DROP TABLE \`security_keys\``);
	}
}
