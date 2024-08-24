import { MigrationInterface, QueryRunner } from "typeorm";

export class TeamMemberRole1724477620293 implements MigrationInterface {
	name = "TeamMemberRole1724477620293";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			"ALTER TABLE team_members ADD COLUMN role text NOT NULL",
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("ALTER TABLE team_members DROP COLUMN role");
	}
}
