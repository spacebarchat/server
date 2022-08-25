import { MigrationInterface, QueryRunner } from "typeorm";

export class mobileClientFixes1661452492660 implements MigrationInterface {
    name = 'mobileClientFixes1661452492660'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`purchased_flags\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`premium_usage_flags\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_settings\`
            ADD \`banner_color\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_settings\`
            ADD \`friend_discovery_flags\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_settings\`
            ADD \`view_nsfw_guilds\` tinyint NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_settings\`
            ADD \`passwordless\` tinyint NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`mfa_enabled\` \`mfa_enabled\` tinyint NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`channels\` CHANGE \`nsfw\` \`nsfw\` tinyint NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`guilds\` CHANGE \`nsfw\` \`nsfw\` tinyint NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`guilds\` CHANGE \`nsfw\` \`nsfw\` tinyint NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`channels\` CHANGE \`nsfw\` \`nsfw\` tinyint NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`mfa_enabled\` \`mfa_enabled\` tinyint NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_settings\` DROP COLUMN \`passwordless\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_settings\` DROP COLUMN \`view_nsfw_guilds\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_settings\` DROP COLUMN \`friend_discovery_flags\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_settings\` DROP COLUMN \`banner_color\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`premium_usage_flags\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`purchased_flags\`
        `);
    }

}
