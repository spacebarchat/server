import { MigrationInterface, QueryRunner } from "typeorm";

export class AvatarDecorationsRelation1790152636577 implements MigrationInterface {
    name = "AvatarDecorationsRelation1790152636577";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "avatar_decoration_id" bigint`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_119117c066ad70abbe777d34f40" UNIQUE ("avatar_decoration_id")`);
        await queryRunner.query(
            `ALTER TABLE "users" ADD CONSTRAINT "FK_user_avatar_decoration_id" FOREIGN KEY ("avatar_decoration_id") REFERENCES "avatar_decorations"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_user_avatar_decoration_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_119117c066ad70abbe777d34f40"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar_decoration_id"`);
    }
}
