import { MigrationInterface, QueryRunner } from "typeorm";

export class InvitersAreDeletable1660416072362 implements MigrationInterface {
    name = 'InvitersAreDeletable1660416072362'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`invites\` DROP FOREIGN KEY \`FK_15c35422032e0b22b4ada95f48f\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_76ba283779c8441fd5ff819c8c\` ON \`users\`
        `);
        await queryRunner.query(`
            CREATE TABLE \`plugin_config\` (
                \`key\` varchar(255) NOT NULL,
                \`value\` text NULL,
                PRIMARY KEY (\`key\`)
            ) ENGINE = InnoDB
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
            ALTER TABLE \`invites\`
            ADD CONSTRAINT \`FK_15c35422032e0b22b4ada95f48f\` FOREIGN KEY (\`inviter_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`invites\` DROP FOREIGN KEY \`FK_15c35422032e0b22b4ada95f48f\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`channels\` DROP COLUMN \`default_thread_rate_limit_per_user\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`channels\` DROP COLUMN \`flags\`
        `);
        await queryRunner.query(`
            DROP TABLE \`plugin_config\`
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_76ba283779c8441fd5ff819c8c\` ON \`users\` (\`settingsId\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`invites\`
            ADD CONSTRAINT \`FK_15c35422032e0b22b4ada95f48f\` FOREIGN KEY (\`inviter_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
