import { MigrationInterface, QueryRunner } from "typeorm";

export class guildMemberProfiles1661885830688 implements MigrationInterface {
    name = 'guildMemberProfiles1661885830688'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "members"
            ADD "avatar" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "members"
            ADD "banner" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "members"
            ADD "bio" character varying NOT NULL default ''
        `);
        await queryRunner.query(`
            ALTER TABLE "members"
            ADD "communication_disabled_until" TIMESTAMP
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "members" DROP COLUMN "communication_disabled_until"
        `);
        await queryRunner.query(`
            ALTER TABLE "members" DROP COLUMN "bio"
        `);
        await queryRunner.query(`
            ALTER TABLE "members" DROP COLUMN "banner"
        `);
        await queryRunner.query(`
            ALTER TABLE "members" DROP COLUMN "avatar"
        `);
    }

}
