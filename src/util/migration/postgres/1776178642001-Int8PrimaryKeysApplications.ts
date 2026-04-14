import { MigrationInterface, QueryRunner } from "typeorm";

export class Int8PrimaryKeysApplications1776178642001 implements MigrationInterface {
    name = "Int8PrimaryKeysApplications1776178642001";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "int8");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "varchar");
    }

    private async convertPks(queryRunner: QueryRunner, to: string) {
        // applications
        // -> messages
        await queryRunner.query(`ALTER TABLE messages DROP CONSTRAINT "FK_5d3ec1cb962de6488637fd779d6";`); // application_id
        await queryRunner.query(`ALTER TABLE messages ALTER COLUMN application_id TYPE ${to} USING application_id::${to};`);
        // --> webhooks
        await queryRunner.query(`ALTER TABLE webhooks DROP CONSTRAINT "FK_c3e5305461931763b56aa905f1c";`); // application_id
        await queryRunner.query(`ALTER TABLE webhooks ALTER COLUMN application_id TYPE ${to} USING application_id::${to};`);
        // and finally, cleanup
        await queryRunner.query(`ALTER TABLE applications ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(`ALTER TABLE webhooks ADD CONSTRAINT "FK_c3e5305461931763b56aa905f1c" FOREIGN KEY (application_id) REFERENCES applications(id);`);
        await queryRunner.query(`ALTER TABLE messages ADD CONSTRAINT "FK_5d3ec1cb962de6488637fd779d6" FOREIGN KEY (application_id) REFERENCES applications(id);`);
    }
}
