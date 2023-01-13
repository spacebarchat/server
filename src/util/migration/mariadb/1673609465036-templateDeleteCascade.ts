import { MigrationInterface, QueryRunner } from "typeorm";

export class templateDeleteCascade1673609465036 implements MigrationInterface {
	name = "templateDeleteCascade1673609465036";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE \`templates\` DROP FOREIGN KEY \`FK_445d00eaaea0e60a017a5ed0c11\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`templates\` ADD CONSTRAINT \`FK_445d00eaaea0e60a017a5ed0c11\` FOREIGN KEY (\`source_guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE \`templates\` DROP FOREIGN KEY \`FK_445d00eaaea0e60a017a5ed0c11\``,
		);
		await queryRunner.query(
			`ALTER TABLE \`templates\` ADD CONSTRAINT \`FK_445d00eaaea0e60a017a5ed0c11\` FOREIGN KEY (\`source_guild_id\`) REFERENCES \`guilds\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}
}
