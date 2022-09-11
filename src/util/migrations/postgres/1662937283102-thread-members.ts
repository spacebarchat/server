import { MigrationInterface, QueryRunner } from "typeorm";

export class threadMembers1662937283102 implements MigrationInterface {
    name = 'threadMembers1662937283102'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "thread_members" (
                "index" SERIAL NOT NULL,
                "id" character varying NOT NULL,
                "user_id" character varying NOT NULL,
                "join_timestamp" TIMESTAMP NOT NULL,
                "muted" boolean NOT NULL,
                "flags" integer NOT NULL,
                CONSTRAINT "PK_22232a9f7a08fb9967a9c78da53" PRIMARY KEY ("index")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_2cdd683cbb6e3a1e72ea88ccac" ON "thread_members" ("id", "user_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "members"
            ALTER COLUMN "bio" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "thread_members"
            ADD CONSTRAINT "FK_cf20e37d71b0e1bf1ab633861c8" FOREIGN KEY ("id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "thread_members"
            ADD CONSTRAINT "FK_c8b35f932d7abdf92351b041b55" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "thread_members" DROP CONSTRAINT "FK_c8b35f932d7abdf92351b041b55"
        `);
        await queryRunner.query(`
            ALTER TABLE "thread_members" DROP CONSTRAINT "FK_cf20e37d71b0e1bf1ab633861c8"
        `);
        await queryRunner.query(`
            ALTER TABLE "members"
            ALTER COLUMN "bio"
            SET DEFAULT ''
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_2cdd683cbb6e3a1e72ea88ccac"
        `);
        await queryRunner.query(`
            DROP TABLE "thread_members"
        `);
    }

}
