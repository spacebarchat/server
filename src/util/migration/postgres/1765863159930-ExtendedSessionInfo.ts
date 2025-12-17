import { MigrationInterface, QueryRunner } from "typeorm";

export class ExtendedSessionInfo1765863159930 implements MigrationInterface {
    name = "ExtendedSessionInfo1765863159930";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "PK_3238ef96f18b355b671619111bc"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "is_admin_session" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "last_seen" TIMESTAMP NOT NULL DEFAULT '1970-01-01 00:00:00'`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "last_seen_ip" character varying NOT NULL DEFAULT '127.0.0.1'`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "last_seen_location" character varying`);
        await queryRunner.query(`ALTER TABLE "webhooks" ALTER COLUMN "source_channel_id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "PK_9340188c93349808f10d1db74a8" PRIMARY KEY ("session_id")`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_085d540d9f418cfbdc7bd55bb1" ON "sessions" ("user_id") `);
        await queryRunner.query(
            `ALTER TABLE "sessions" ADD CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19"`);
        await queryRunner.query(`ALTER TABLE "webhooks" DROP CONSTRAINT "FK_4495b7032a33c6b8b605d030398"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_085d540d9f418cfbdc7bd55bb1"`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "PK_9340188c93349808f10d1db74a8"`);
        await queryRunner.query(
            `ALTER TABLE "sessions" ADD CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "last_seen_location"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "last_seen_ip"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "last_seen"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "is_admin_session"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id")`);
    }
}
