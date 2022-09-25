import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class Stickers1634308884591 implements MigrationInterface {
	name = "Stickers1634308884591";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropForeignKey("read_states", "FK_6f255d873cfbfd7a93849b7ff74");
		await queryRunner.changeColumn(
			"stickers",
			"tags",
			new TableColumn({ name: "tags", type: "varchar", isNullable: true })
		);
		await queryRunner.changeColumn(
			"stickers",
			"pack_id",
			new TableColumn({ name: "pack_id", type: "varchar", isNullable: true })
		);
		await queryRunner.changeColumn("stickers", "type", new TableColumn({ name: "type", type: "integer" }));
		await queryRunner.changeColumn(
			"stickers",
			"format_type",
			new TableColumn({ name: "format_type", type: "integer" })
		);
		await queryRunner.changeColumn(
			"stickers",
			"available",
			new TableColumn({ name: "available", type: "boolean", isNullable: true })
		);
		await queryRunner.changeColumn(
			"stickers",
			"user_id",
			new TableColumn({ name: "user_id", type: "boolean", isNullable: true })
		);
		await queryRunner.createForeignKey(
			"stickers",
			new TableForeignKey({
				name: "FK_8f4ee73f2bb2325ff980502e158",
				columnNames: ["user_id"],
				referencedColumnNames: ["id"],
				referencedTableName: "users",
				onDelete: "CASCADE",
			})
		);
		await queryRunner.createTable(
			new Table({
				name: "sticker_packs",
				columns: [
					new TableColumn({ name: "id", type: "varchar", isPrimary: true }),
					new TableColumn({ name: "name", type: "varchar" }),
					new TableColumn({ name: "description", type: "varchar", isNullable: true }),
					new TableColumn({ name: "banner_asset_id", type: "varchar", isNullable: true }),
					new TableColumn({ name: "cover_sticker_id", type: "varchar", isNullable: true }),
				],
				foreignKeys: [
					new TableForeignKey({
						columnNames: ["cover_sticker_id"],
						referencedColumnNames: ["id"],
						referencedTableName: "stickers",
					}),
				],
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {}
}
