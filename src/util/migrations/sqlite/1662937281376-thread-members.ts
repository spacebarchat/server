import { MigrationInterface, QueryRunner } from "typeorm";

export class threadMembers1662937281376 implements MigrationInterface {
    name = 'threadMembers1662937281376'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "thread_members" (
                "index" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "id" varchar NOT NULL,
                "user_id" varchar NOT NULL,
                "join_timestamp" datetime NOT NULL,
                "muted" boolean NOT NULL,
                "flags" integer NOT NULL
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_2cdd683cbb6e3a1e72ea88ccac" ON "thread_members" ("id", "user_id")
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_2cdd683cbb6e3a1e72ea88ccac"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_thread_members" (
                "index" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "id" varchar NOT NULL,
                "user_id" varchar NOT NULL,
                "join_timestamp" datetime NOT NULL,
                "muted" boolean NOT NULL,
                "flags" integer NOT NULL,
                CONSTRAINT "FK_cf20e37d71b0e1bf1ab633861c8" FOREIGN KEY ("id") REFERENCES "channels" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_c8b35f932d7abdf92351b041b55" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_thread_members"(
                    "index",
                    "id",
                    "user_id",
                    "join_timestamp",
                    "muted",
                    "flags"
                )
            SELECT "index",
                "id",
                "user_id",
                "join_timestamp",
                "muted",
                "flags"
            FROM "thread_members"
        `);
        await queryRunner.query(`
            DROP TABLE "thread_members"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_thread_members"
                RENAME TO "thread_members"
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_2cdd683cbb6e3a1e72ea88ccac" ON "thread_members" ("id", "user_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "IDX_2cdd683cbb6e3a1e72ea88ccac"
        `);
        await queryRunner.query(`
            ALTER TABLE "thread_members"
                RENAME TO "temporary_thread_members"
        `);
        await queryRunner.query(`
            CREATE TABLE "thread_members" (
                "index" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "id" varchar NOT NULL,
                "user_id" varchar NOT NULL,
                "join_timestamp" datetime NOT NULL,
                "muted" boolean NOT NULL,
                "flags" integer NOT NULL
            )
        `);
        await queryRunner.query(`
            INSERT INTO "thread_members"(
                    "index",
                    "id",
                    "user_id",
                    "join_timestamp",
                    "muted",
                    "flags"
                )
            SELECT "index",
                "id",
                "user_id",
                "join_timestamp",
                "muted",
                "flags"
            FROM "temporary_thread_members"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_thread_members"
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_2cdd683cbb6e3a1e72ea88ccac" ON "thread_members" ("id", "user_id")
        `);
        await queryRunner.query(`
            DROP INDEX "IDX_2cdd683cbb6e3a1e72ea88ccac"
        `);
        await queryRunner.query(`
            DROP TABLE "thread_members"
        `);
    }

}
