import { MigrationInterface, QueryRunner } from "typeorm";

export class threads1661863774066 implements MigrationInterface {
	name = "threads1661863774066";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE "channels"
            ADD "member_count" integer
        `);
		await queryRunner.query(`
            ALTER TABLE "channels"
            ADD "message_count" integer
        `);
		await queryRunner.query(`
            ALTER TABLE "channels"
            ADD "total_message_sent" integer
        `);
		await queryRunner.query(`
            ALTER TABLE "channels"
            ADD "thread_metadata" text
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
            ALTER TABLE "channels" DROP COLUMN "thread_metadata"
        `);
		await queryRunner.query(`
            ALTER TABLE "channels" DROP COLUMN "total_message_sent"
        `);
		await queryRunner.query(`
            ALTER TABLE "channels" DROP COLUMN "message_count"
        `);
		await queryRunner.query(`
            ALTER TABLE "channels" DROP COLUMN "member_count"
        `);
	}
}
