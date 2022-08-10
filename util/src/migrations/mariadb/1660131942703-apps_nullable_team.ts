import { MigrationInterface, QueryRunner } from "typeorm";

export class appsNullableTeam1660131942703 implements MigrationInterface {
    name = 'appsNullableTeam1660131942703'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_2ce5a55796fe4c2f77ece57a64\` ON \`applications\`
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_2ce5a55796fe4c2f77ece57a64\` ON \`applications\` (\`bot_user_id\`)
        `);
    }

}
