import { MigrationInterface, QueryRunner } from "typeorm";

export class ReleaseTypo1648643945733 implements MigrationInterface {
	name = "ReleaseTypo1648643945733";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.renameTable("client_relase", "client_release");
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.renameTable("client_release", "client_relase");
	}
}
