import { MigrationInterface, QueryRunner } from "typeorm";

export class ThreadMembers1769653303971 implements MigrationInterface {
    name = "ThreadMembers1769653303971";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "thread_members" ("index" SERIAL NOT NULL, "id" character varying NOT NULL, "member_id" integer NOT NULL, "join_timestamp" TIMESTAMP NOT NULL, "muted" boolean NOT NULL, "mute_config" text, "flags" integer NOT NULL, CONSTRAINT "PK_22232a9f7a08fb9967a9c78da53" PRIMARY KEY ("index"))`,
        );
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_bde0970b6a26bdbd83508addd2" ON "thread_members" ("id", "member_id") `);
        await queryRunner.query(
            `ALTER TABLE "thread_members" ADD CONSTRAINT "FK_cf20e37d71b0e1bf1ab633861c8" FOREIGN KEY ("id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "thread_members" ADD CONSTRAINT "FK_606ac45e8756d3440c584477f4e" FOREIGN KEY ("member_id") REFERENCES "members"("index") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "thread_members" DROP CONSTRAINT "FK_606ac45e8756d3440c584477f4e"`);
        await queryRunner.query(`ALTER TABLE "thread_members" DROP CONSTRAINT "FK_cf20e37d71b0e1bf1ab633861c8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bde0970b6a26bdbd83508addd2"`);
        await queryRunner.query(`DROP TABLE "thread_members"`);
    }
}
