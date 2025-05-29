import { MigrationInterface, QueryRunner } from "typeorm";

export class Voice1745625724865 implements MigrationInterface {
	name = "Voice1745625724865";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "streams" ("id" character varying NOT NULL, "owner_id" character varying NOT NULL, "channel_id" character varying NOT NULL, "endpoint" character varying NOT NULL, CONSTRAINT "PK_40440b6f569ebc02bc71c25c499" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "stream_sessions" ("id" character varying NOT NULL, "stream_id" character varying NOT NULL, "user_id" character varying NOT NULL, "token" character varying, "session_id" character varying NOT NULL, "used" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_49bdc3f66394c12478f8371c546" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`ALTER TABLE "streams" ADD CONSTRAINT "FK_1b566f9b54d1cda271da53ac82f" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "streams" ADD CONSTRAINT "FK_5101f0cded27ff0aae78fc4eed7" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "stream_sessions" ADD CONSTRAINT "FK_8b5a028a34dae9ee54af37c9c32" FOREIGN KEY ("stream_id") REFERENCES "streams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "stream_sessions" ADD CONSTRAINT "FK_13ae5c29aff4d0890c54179511a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "stream_sessions" DROP CONSTRAINT "FK_13ae5c29aff4d0890c54179511a"`,
		);
		await queryRunner.query(
			`ALTER TABLE "stream_sessions" DROP CONSTRAINT "FK_8b5a028a34dae9ee54af37c9c32"`,
		);
		await queryRunner.query(
			`ALTER TABLE "streams" DROP CONSTRAINT "FK_5101f0cded27ff0aae78fc4eed7"`,
		);
		await queryRunner.query(
			`ALTER TABLE "streams" DROP CONSTRAINT "FK_1b566f9b54d1cda271da53ac82f"`,
		);
		await queryRunner.query(`DROP TABLE "stream_sessions"`);
		await queryRunner.query(`DROP TABLE "streams"`);
	}
}
