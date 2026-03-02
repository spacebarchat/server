import { MigrationInterface, QueryRunner } from "typeorm";

export class MemberFlags1772403866471 implements MigrationInterface {
    name = "MemberFlags1772403866471";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" ADD "flags" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "members" DROP COLUMN "flags"`);
    }
}
