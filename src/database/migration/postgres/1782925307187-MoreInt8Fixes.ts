import { MigrationInterface, QueryRunner } from "typeorm";

export class MoreInt8Fixes17829253071887 implements MigrationInterface {
    name = "MoreInt8Fixes1782925307187";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE application_commands ALTER COLUMN guild_id TYPE int8 USING guild_id::int8`);
        await queryRunner.query(`ALTER TABLE application_commands ALTER COLUMN name_localizations TYPE jsonb USING name_localizations::jsonb`);
        // oops, this one wasnt supposed to be an int8
        await queryRunner.query(`ALTER TABLE badges ALTER COLUMN id TYPE character varying USING id::character varying`);
        await queryRunner.query(`ALTER TABLE categories ALTER COLUMN id TYPE int4 USING id::int4`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE application_commands ALTER COLUMN guild_id TYPE character varying USING guild_id::character varying`);
        await queryRunner.query(`ALTER TABLE application_commands ALTER COLUMN name_localizations TYPE character varying USING name_localizations::character varying`);
        await queryRunner.query(`ALTER TABLE badges ALTER COLUMN id TYPE int8 USING id::int8`);
        await queryRunner.query(`ALTER TABLE categories ALTER COLUMN id TYPE int8 USING id::int8`);
    }
}
