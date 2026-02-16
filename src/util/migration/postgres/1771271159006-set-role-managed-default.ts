import { MigrationInterface, QueryRunner } from "typeorm";

export class SetRoleManagedDefault1771271159006 implements MigrationInterface {
    name = "SetRoleManagedDefault1771271159006";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "managed" SET DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "managed" DROP DEFAULT`);
    }
}
