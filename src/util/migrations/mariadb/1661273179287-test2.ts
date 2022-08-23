import { MigrationInterface, QueryRunner } from "typeorm";

export class test21661273179287 implements MigrationInterface {
    name = 'test21661273179287'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_76ba283779c8441fd5ff819c8c\` ON \`users\`
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_76ba283779c8441fd5ff819c8c\` ON \`users\` (\`settingsId\`)
        `);
    }

}
