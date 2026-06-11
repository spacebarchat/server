import { MigrationInterface, QueryRunner } from "typeorm";

export class Int8PrimaryKeysTemplates1776178642011 implements MigrationInterface {
    name = "Int8PrimaryKeysTemplates1776178642011";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "int8");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "varchar");
    }

    private async convertPks(queryRunner: QueryRunner, to: string) {
        // templates
        // -> guilds
        await queryRunner.query(`ALTER TABLE guilds DROP CONSTRAINT "FK_e2a2f873a64a5cf62526de42325";`); //template_id
        await queryRunner.query(`ALTER TABLE guilds ALTER COLUMN template_id TYPE ${to} USING template_id::${to}`);
        // and finally, cleanup
        await queryRunner.query(`ALTER TABLE templates ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(`ALTER TABLE public.guilds ADD CONSTRAINT "FK_e2a2f873a64a5cf62526de42325" FOREIGN KEY (template_id) REFERENCES templates(id);`);
    }
}
