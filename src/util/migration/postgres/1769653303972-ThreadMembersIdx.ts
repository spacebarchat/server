import { MigrationInterface, QueryRunner } from "typeorm";

export class ThreadMembersIdx1769653303972 implements MigrationInterface {
    name = "ThreadMembersIdx1769653303972";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE public.thread_members RENAME COLUMN member_id TO member_idx;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE public.thread_members RENAME COLUMN member_idx TO member_id;`);
    }
}
