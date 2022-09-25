import { MigrationInterface, QueryRunner } from "typeorm";

export class VanityInvite1633881705509 implements MigrationInterface {
	name = "VanityInvite1633881705509";

	public async up(queryRunner: QueryRunner): Promise<void> {
		try {
			await queryRunner.query(`ALTER TABLE "emojis" DROP COLUMN vanity_url_code`);
			await queryRunner.query(`ALTER TABLE "emojis" DROP CONSTRAINT FK_c2c1809d79eb120ea0cb8d342ad`);
		} catch (error) {}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "emojis" ADD vanity_url_code varchar`);
		await queryRunner.query(
			`ALTER TABLE "emojis" ADD CONSTRAINT FK_c2c1809d79eb120ea0cb8d342ad FOREIGN KEY ("vanity_url_code") REFERENCES "invites"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
	}
}
