import { MigrationInterface, QueryRunner } from "typeorm";

export class Int2CategoryId1786139482251 implements MigrationInterface {
    name = "Int2CategoryId1786139482251";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE guilds ALTER COLUMN primary_category_id TYPE int2 USING primary_category_id::int2`);
        await queryRunner.query(`CREATE SEQUENCE categories_id_seq AS int2`);
        await queryRunner.query(`ALTER TABLE categories ALTER COLUMN id TYPE int2 USING id::int2`);
        await queryRunner.query(`ALTER TABLE categories ALTER COLUMN id SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE categories ALTER COLUMN id SET DEFAULT nextval('categories_id_seq')`);
        await queryRunner.query(`ALTER SEQUENCE categories_id_seq OWNED BY categories.id`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE guilds ALTER COLUMN primary_category_id TYPE bigint USING primary_category_id::bigint`);
        await queryRunner.query(`ALTER TABLE categories ALTER COLUMN id TYPE bigint USING id::bigint`);
    }
}
