import { MigrationInterface, QueryRunner } from "typeorm";

export class premiumSinceAsDate1659921859145 implements MigrationInterface {
    name = 'premiumSinceAsDate1659921859145'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`members\` DROP COLUMN \`premium_since\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`members\`
            ADD \`premium_since\` datetime NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`members\` DROP COLUMN \`premium_since\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`members\`
            ADD \`premium_since\` bigint NULL
        `);
    }

}
