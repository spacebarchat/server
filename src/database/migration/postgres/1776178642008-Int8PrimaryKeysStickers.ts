import { MigrationInterface, QueryRunner } from "typeorm";

export class Int8PrimaryKeysStickers1776178642008 implements MigrationInterface {
    name = "Int8PrimaryKeysStickers1776178642008";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "int8");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "varchar");
    }

    private async convertPks(queryRunner: QueryRunner, to: string) {
        // stickers
        // -> message_stickers
        await queryRunner.query(`ALTER TABLE message_stickers DROP CONSTRAINT "FK_e22a70819d07659c7a71c112a1f";`); //stickersId
        await queryRunner.query(`ALTER TABLE message_stickers ALTER COLUMN "stickersId" TYPE ${to} USING "stickersId"::${to}`);
        // -> sticker_packs
        await queryRunner.query(`ALTER TABLE sticker_packs DROP CONSTRAINT "FK_448fafba4355ee1c837bbc865f1";`); //coverStickerId
        await queryRunner.query(`ALTER TABLE sticker_packs ALTER COLUMN "coverStickerId" TYPE ${to} USING "coverStickerId"::${to}`);
        // and finally, cleanup
        await queryRunner.query(`ALTER TABLE stickers ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(
            `ALTER TABLE public.message_stickers ADD CONSTRAINT "FK_e22a70819d07659c7a71c112a1f" FOREIGN KEY ("stickersId") REFERENCES stickers(id) ON UPDATE CASCADE ON DELETE CASCADE;`,
        );
        await queryRunner.query(`ALTER TABLE public.sticker_packs ADD CONSTRAINT "FK_448fafba4355ee1c837bbc865f1" FOREIGN KEY ("coverStickerId") REFERENCES stickers (id);`);
    }
}
