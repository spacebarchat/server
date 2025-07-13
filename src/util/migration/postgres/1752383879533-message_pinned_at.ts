import { MigrationInterface, QueryRunner } from "typeorm";

export class MessagePinnedAt1752383879533 implements MigrationInterface {
	name = "MessagePinnedAt1752383879533";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "messages" ADD "pinned_at" TIMESTAMP`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "messages" DROP COLUMN "pinned_at"`,
		);
	}
}
