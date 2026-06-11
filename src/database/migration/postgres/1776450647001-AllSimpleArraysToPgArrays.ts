import { MigrationInterface, QueryRunner } from "typeorm";

export class AllSimpleArraysToPgArrays1776450647001 implements MigrationInterface {
    name = "AllSimpleArraysToPgArrays1776450647001";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.cleanAndConvertToArray(queryRunner, "applications", "redirect_uris", "varchar");
        await this.cleanAndConvertToArray(queryRunner, "applications", "tags", "varchar");
        // await this.cleanAndConvertToArray(queryRunner, "applications", "rpc_origins", "varchar");

        await this.cleanAndConvertToArray(queryRunner, "automod_rules", "exempt_channels", "int8");
        await this.cleanAndConvertToArray(queryRunner, "automod_rules", "exempt_roles", "int8");

        await this.cleanAndConvertToArray(queryRunner, "connected_accounts", "integrations", "varchar");

        await this.cleanAndConvertToArray(queryRunner, "emojis", "roles", "int8");
        await this.cleanAndConvertToArray(queryRunner, "emojis", "groups", "int8");

        await this.cleanAndConvertToArray(queryRunner, "guilds", "features", "varchar");

        await this.cleanAndConvertToArray(queryRunner, "members", "theme_colors", "int4");

        await this.cleanAndConvertToArray(queryRunner, "team_members", "permissions", "varchar");

        await this.cleanAndConvertToArray(queryRunner, "users", "theme_colors", "int4");
        await this.cleanAndConvertToArray(queryRunner, "users", "fingerprints", "varchar");
        await this.cleanAndConvertToArray(queryRunner, "users", "badge_ids", "int8");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log(`Migration ${this.name}.down() not implemented`);
    }

    private async cleanAndConvertToArray(queryRunner: QueryRunner, table: string, column: string, type: string) {
        // spacebar was randomly adding json data into CSV values, unwrap them
        await queryRunner.query(`UPDATE ${table} SET ${column} = REPLACE(${column}, '"', '') WHERE ${column} ~ '"';`);
        await queryRunner.query(`UPDATE ${table} SET ${column} = REPLACE(${column}, '[', '') WHERE ${column} ~ '\\[';`);
        await queryRunner.query(`UPDATE ${table} SET ${column} = REPLACE(${column}, ']', '') WHERE ${column} ~ '\\]';`);
        await queryRunner.query(`ALTER TABLE ${table} ALTER COLUMN ${column} TYPE ${type}[] USING string_to_array(${column}, ',')::${type}[];`);
    }
}
