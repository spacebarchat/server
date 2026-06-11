import { MigrationInterface, QueryRunner } from "typeorm";

export class Int8PrimaryKeysStickerPacks1776178642007 implements MigrationInterface {
    name = "Int8PrimaryKeysStickerPacks1776178642007";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "int8");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "varchar");
    }

    private async convertPks(queryRunner: QueryRunner, to: string) {
        // sticker_packs
        // -> stickers
        await queryRunner.query(`ALTER TABLE stickers DROP CONSTRAINT "FK_e7cfa5cefa6661b3fb8fda8ce69";`); //pack_id
        await queryRunner.query(`ALTER TABLE stickers ALTER COLUMN pack_id TYPE ${to} USING pack_id::${to}`);
        // and finally, cleanup
        await queryRunner.query(`ALTER TABLE sticker_packs ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(
            `ALTER TABLE public.stickers ADD CONSTRAINT "FK_e7cfa5cefa6661b3fb8fda8ce69" FOREIGN KEY (pack_id) REFERENCES sticker_packs(id) ON DELETE CASCADE;`,
        );
    }
}
