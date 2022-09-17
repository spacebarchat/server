import { MigrationInterface, QueryRunner } from "typeorm";

export class dropIdForRegistrationTokens1663448562034 implements MigrationInterface {
	name = "dropIdForRegistrationTokens1663448562034";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE \`valid_registration_tokens\` DROP PRIMARY KEY
        `);
		await queryRunner.query(`
            ALTER TABLE \`valid_registration_tokens\` DROP COLUMN \`id\`
        `);
		await queryRunner.query(`
            ALTER TABLE \`valid_registration_tokens\`
            ADD PRIMARY KEY (\`token\`)
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE \`valid_registration_tokens\` DROP PRIMARY KEY
        `);
		await queryRunner.query(`
            ALTER TABLE \`valid_registration_tokens\`
            ADD \`id\` varchar(255) NOT NULL
        `);
		await queryRunner.query(`
            ALTER TABLE \`valid_registration_tokens\`
            ADD PRIMARY KEY (\`id\`)
        `);
	}
}
