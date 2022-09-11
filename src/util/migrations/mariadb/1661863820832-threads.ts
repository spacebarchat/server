import { MigrationInterface, QueryRunner } from "typeorm";

export class threads1661863820832 implements MigrationInterface {
	name = "threads1661863820832";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE \`channels\`
            ADD \`member_count\` int
        `);
		await queryRunner.query(`
            ALTER TABLE \`channels\`
            ADD \`message_count\` int
        `);
		await queryRunner.query(`
            ALTER TABLE \`channels\`
            ADD \`total_message_sent\` int
        `);
		await queryRunner.query(`
            ALTER TABLE \`channels\`
            ADD \`thread_metadata\` text NULL
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE \`channels\` DROP COLUMN \`thread_metadata\`
        `);
		await queryRunner.query(`
            ALTER TABLE \`channels\` DROP COLUMN \`total_message_sent\`
        `);
		await queryRunner.query(`
            ALTER TABLE \`channels\` DROP COLUMN \`message_count\`
        `);
		await queryRunner.query(`
            ALTER TABLE \`channels\` DROP COLUMN \`member_count\`
        `);
	}
}
