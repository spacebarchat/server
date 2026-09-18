import { MigrationInterface, QueryRunner } from "typeorm";

export class RelationshipSpamAndDateMeta1789700696383 implements MigrationInterface {
    name = "RelationshipSpamAndDateMeta1789700696383";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "relationships" ADD "user_ignored" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "relationships" ADD "note" character varying`);
        await queryRunner.query(`ALTER TABLE "relationships" ADD "stranger_request" boolean`);
        await queryRunner.query(`ALTER TABLE "relationships" ADD "is_spam_request" boolean`);
        await queryRunner.query(`ALTER TABLE "relationships" ADD "since" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "relationships" DROP COLUMN "since"`);
        await queryRunner.query(`ALTER TABLE "relationships" DROP COLUMN "is_spam_request"`);
        await queryRunner.query(`ALTER TABLE "relationships" DROP COLUMN "stranger_request"`);
        await queryRunner.query(`ALTER TABLE "relationships" DROP COLUMN "note"`);
        await queryRunner.query(`ALTER TABLE "relationships" DROP COLUMN "user_ignored"`);
    }
}
