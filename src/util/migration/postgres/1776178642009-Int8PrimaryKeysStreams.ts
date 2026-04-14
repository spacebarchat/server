import { MigrationInterface, QueryRunner } from "typeorm";

export class Int8PrimaryKeysStreams1776178642009 implements MigrationInterface {
    name = "Int8PrimaryKeysStreams1776178642009";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "int8");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "varchar");
    }

    private async convertPks(queryRunner: QueryRunner, to: string) {
        // streams
        // -> stream_sessions
        await queryRunner.query(`ALTER TABLE stream_sessions DROP CONSTRAINT "FK_8b5a028a34dae9ee54af37c9c32";`); //stream_id
        await queryRunner.query(`ALTER TABLE stream_sessions ALTER COLUMN stream_id TYPE ${to} USING stream_id::${to}`);
        // and finally, cleanup
        await queryRunner.query(`ALTER TABLE streams ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(
            `ALTER TABLE public.stream_sessions ADD CONSTRAINT "FK_8b5a028a34dae9ee54af37c9c32" FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE CASCADE;`,
        );
    }
}
