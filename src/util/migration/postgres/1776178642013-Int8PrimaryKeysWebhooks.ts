import { MigrationInterface, QueryRunner } from "typeorm";

export class Int8PrimaryKeysWebhooks1776178642013 implements MigrationInterface {
    name = "Int8PrimaryKeysWebhooks1776178642013";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "int8");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "varchar");
    }

    private async convertPks(queryRunner: QueryRunner, to: string) {
        // webhooks
        // -> messages
        await queryRunner.query(`ALTER TABLE messages DROP CONSTRAINT "FK_f83c04bcf1df4e5c0e7a52ed348";`); //webhook_id
        await queryRunner.query(`ALTER TABLE messages ALTER COLUMN webhook_id TYPE ${to} USING webhook_id::${to}`);
        // and finally, cleanup
        await queryRunner.query(`ALTER TABLE webhooks ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(`ALTER TABLE public.messages ADD CONSTRAINT "FK_f83c04bcf1df4e5c0e7a52ed348" FOREIGN KEY (webhook_id) REFERENCES webhooks(id);`);
    }
}
