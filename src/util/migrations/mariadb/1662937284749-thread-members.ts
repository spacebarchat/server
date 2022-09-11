import { MigrationInterface, QueryRunner } from "typeorm";

export class threadMembers1662937284749 implements MigrationInterface {
    name = 'threadMembers1662937284749'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`thread_members\` (
                \`index\` int NOT NULL AUTO_INCREMENT,
                \`id\` varchar(255) NOT NULL,
                \`user_id\` varchar(255) NOT NULL,
                \`join_timestamp\` datetime NOT NULL,
                \`muted\` tinyint NOT NULL,
                \`flags\` int NOT NULL,
                UNIQUE INDEX \`IDX_2cdd683cbb6e3a1e72ea88ccac\` (\`id\`, \`user_id\`),
                PRIMARY KEY (\`index\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`thread_members\`
            ADD CONSTRAINT \`FK_cf20e37d71b0e1bf1ab633861c8\` FOREIGN KEY (\`id\`) REFERENCES \`channels\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`thread_members\`
            ADD CONSTRAINT \`FK_c8b35f932d7abdf92351b041b55\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`thread_members\` DROP FOREIGN KEY \`FK_c8b35f932d7abdf92351b041b55\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`thread_members\` DROP FOREIGN KEY \`FK_cf20e37d71b0e1bf1ab633861c8\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_2cdd683cbb6e3a1e72ea88ccac\` ON \`thread_members\`
        `);
        await queryRunner.query(`
            DROP TABLE \`thread_members\`
        `);
    }

}
