import { MigrationInterface, QueryRunner } from "typeorm";

export class CategoryLocalizationsDefault1776400000000 implements MigrationInterface {
    name = "CategoryLocalizationsDefault1776400000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE categories SET localizations = '{}'::jsonb WHERE localizations IS NULL OR jsonb_typeof(localizations) <> 'object';`);
        await queryRunner.query(`ALTER TABLE categories ALTER COLUMN localizations SET DEFAULT '{}'::jsonb;`);
        await queryRunner.query(`ALTER TABLE categories ALTER COLUMN localizations SET NOT NULL;`);
        await queryRunner.query(`ALTER TABLE categories DROP CONSTRAINT IF EXISTS "CHK_categories_localizations_object";`);
        await queryRunner.query(`ALTER TABLE categories ADD CONSTRAINT "CHK_categories_localizations_object" CHECK (jsonb_typeof(localizations) = 'object');`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE categories DROP CONSTRAINT IF EXISTS "CHK_categories_localizations_object";`);
        await queryRunner.query(`ALTER TABLE categories ALTER COLUMN localizations DROP DEFAULT;`);
    }
}
