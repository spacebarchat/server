import { MigrationInterface, QueryRunner } from "typeorm";

export class Int8PrimaryKeysRoles1776178642006 implements MigrationInterface {
    name = "Int8PrimaryKeysRoles1776178642006";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "int8");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "varchar");
    }

    private async convertPks(queryRunner: QueryRunner, to: string) {
        // roles
        // -> message_role_mentions
        await queryRunner.query(`ALTER TABLE message_role_mentions DROP CONSTRAINT "FK_29d63eb1a458200851bc37d074b";`); //rolesId
        await queryRunner.query(`ALTER TABLE message_role_mentions ALTER COLUMN "rolesId" TYPE ${to} USING "rolesId"::${to}`);
        // -> member_roles
        await queryRunner.query(`ALTER TABLE member_roles DROP CONSTRAINT "FK_e9080e7a7997a0170026d5139c1";`); //role_id
        await queryRunner.query(`ALTER TABLE member_roles ALTER COLUMN "role_id" TYPE ${to} USING "role_id"::${to}`);
        // and finally, cleanup
        await queryRunner.query(`ALTER TABLE roles ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(
            `ALTER TABLE public.message_role_mentions ADD CONSTRAINT "FK_29d63eb1a458200851bc37d074b" FOREIGN KEY ("rolesId") REFERENCES roles(id) ON UPDATE CASCADE ON DELETE CASCADE;`,
        );
        await queryRunner.query(
            `ALTER TABLE public.member_roles ADD CONSTRAINT "FK_e9080e7a7997a0170026d5139c1" FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE CASCADE;`,
        );
    }
}
