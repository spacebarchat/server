import { MigrationInterface, QueryRunner } from "typeorm";

export class MessageInteractionMetadata1760694225225 implements MigrationInterface {
	name = "MessageInteractionMetadata1760694225225";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "messages" ADD "interaction_metadata" text`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "interaction_metadata"`);
	}
}
