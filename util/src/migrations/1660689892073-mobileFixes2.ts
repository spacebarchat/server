import { MigrationInterface, QueryRunner } from "typeorm";

export class mobileFixes21660689892073 implements MigrationInterface {
    name = 'mobileFixes21660689892073'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`user_settings\`
            ADD \`banner_color\` varchar(255) NULL
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
            ALTER TABLE \`user_settings\` DROP COLUMN \`banner_color\`
        `);
    }

}