import { MigrationInterface, QueryRunner } from "typeorm";

export class UserSettingsProtos1752157979333 implements MigrationInterface {
	name = "UserSettingsProtos1752157979333";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE IF EXISTS "user_settings_protos"`);
		await queryRunner.query(
			`CREATE TABLE "user_settings_protos" ("user_id" character varying NOT NULL, "userSettings" text, "frecencySettings" text, CONSTRAINT "PK_8ff3d1961a48b693810c9f99853" PRIMARY KEY ("user_id"))`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_settings_protos" ADD CONSTRAINT "FK_8ff3d1961a48b693810c9f99853" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "user_settings_protos" DROP CONSTRAINT "FK_8ff3d1961a48b693810c9f99853"`);
		await queryRunner.query(`DROP TABLE "user_settings_protos"`);
	}
}
