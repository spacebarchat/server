import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class MigrationTimestamp1634426540271 implements MigrationInterface {
	name = "MigrationTimestamp1634426540271";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.changeColumn(
			"migrations",
			"timestamp",
			new TableColumn({ name: "timestampe", type: "bigint", isNullable: false })
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {}
}
