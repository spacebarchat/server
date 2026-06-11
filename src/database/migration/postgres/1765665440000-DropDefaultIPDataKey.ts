import { MigrationInterface, QueryRunner } from "typeorm";

export class DropDefaultIPDataKey1765665440000 implements MigrationInterface {
    name = "DropDefaultIPDataKey1765665440000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `UPDATE "config" SET "value" = NULL WHERE "key" = 'security_ipdataApiKey' AND "value" = '"eca677b284b3bac29eb72f5e496aa9047f26543605efe99ff2ce35c9"'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `UPDATE "config" SET "value" = '"eca677b284b3bac29eb72f5e496aa9047f26543605efe99ff2ce35c9"' WHERE "key" = 'security_ipdataApiKey' AND "value" IS NULL`,
        );
    }
}
