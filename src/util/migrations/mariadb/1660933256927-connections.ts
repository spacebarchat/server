import { MigrationInterface, QueryRunner } from "typeorm";

export class connections1660933256927 implements MigrationInterface {
    name = 'connections1660933256927'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`connected_accounts\`
            ADD \`external_id\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`connected_accounts\`
            ADD \`integrations\` text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`connected_accounts\` CHANGE \`access_token\` \`access_token\` varchar(255) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`connected_accounts\` CHANGE \`access_token\` \`access_token\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`connected_accounts\` DROP COLUMN \`integrations\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`connected_accounts\` DROP COLUMN \`external_id\`
        `);
    }

}
