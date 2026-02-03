import { MigrationInterface, QueryRunner } from "typeorm";

export class UserProfileCustomisation1770062009127 implements MigrationInterface {
    name = "UserProfileCustomisation1770062009127";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "avatar_decoration_data" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "display_name_styles" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "collectibles" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "primary_guild" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "primary_guild"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "collectibles"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "display_name_styles"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar_decoration_data"`);
    }
}
