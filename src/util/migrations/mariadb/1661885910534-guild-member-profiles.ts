import { MigrationInterface, QueryRunner } from "typeorm";

export class guildMemberProfiles1661885910534 implements MigrationInterface {
    name = 'guildMemberProfiles1661885910534'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`members\`
            ADD \`avatar\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`members\`
            ADD \`banner\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`members\`
            ADD \`bio\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`members\`
            ADD \`communication_disabled_until\` datetime NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`members\` DROP COLUMN \`communication_disabled_until\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`members\` DROP COLUMN \`bio\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`members\` DROP COLUMN \`banner\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`members\` DROP COLUMN \`avatar\`
        `);
    }

}
