import { MigrationInterface, QueryRunner } from "typeorm";

export class fixNullables1660549252130 implements MigrationInterface {
    name = 'fixNullables1660549252130'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_76ba283779c8441fd5ff819c8c\` ON \`users\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`bio\` \`bio\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`mfa_enabled\` \`mfa_enabled\` tinyint NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`mfa_enabled\` \`mfa_enabled\` tinyint NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`bio\` \`bio\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_76ba283779c8441fd5ff819c8c\` ON \`users\` (\`settingsId\`)
        `);
    }

}
