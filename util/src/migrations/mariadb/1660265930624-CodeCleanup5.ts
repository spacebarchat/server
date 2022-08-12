import { MigrationInterface, QueryRunner } from "typeorm";

export class CodeCleanup51660265930624 implements MigrationInterface {
    name = 'CodeCleanup51660265930624'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`settingsId\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD UNIQUE INDEX \`IDX_76ba283779c8441fd5ff819c8c\` (\`settingsId\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`channels\`
            ADD \`flags\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`channels\`
            ADD \`default_thread_rate_limit_per_user\` int NULL
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`REL_76ba283779c8441fd5ff819c8c\` ON \`users\` (\`settingsId\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD CONSTRAINT \`FK_76ba283779c8441fd5ff819c8cf\` FOREIGN KEY (\`settingsId\`) REFERENCES \`user_settings\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_76ba283779c8441fd5ff819c8cf\`
        `);
        await queryRunner.query(`
            DROP INDEX \`REL_76ba283779c8441fd5ff819c8c\` ON \`users\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`channels\` DROP COLUMN \`default_thread_rate_limit_per_user\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`channels\` DROP COLUMN \`flags\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\` DROP INDEX \`IDX_76ba283779c8441fd5ff819c8c\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`settingsId\`
        `);
    }

}
