import { MigrationInterface, QueryRunner } from "typeorm";

export class guildMemberProfiles1661785289467 implements MigrationInterface {
    name = 'guildMemberProfiles1661785289467'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`connected_accounts\` DROP COLUMN \`external_id\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`connected_accounts\` DROP COLUMN \`integrations\`
        `);
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
        await queryRunner.query(`
            ALTER TABLE \`connected_accounts\` CHANGE \`access_token\` \`access_token\` varchar(255) NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`connected_accounts\` CHANGE \`access_token\` \`access_token\` varchar(255) NULL
        `);
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
        await queryRunner.query(`
            ALTER TABLE \`connected_accounts\`
            ADD \`integrations\` text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`connected_accounts\`
            ADD \`external_id\` varchar(255) NOT NULL
        `);
    }

}
