import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class Presence1634424361103 implements MigrationInterface {
	name = "Presence1634424361103";

	public async up(queryRunner: QueryRunner): Promise<void> {
		queryRunner.addColumn("sessions", new TableColumn({ name: "activites", type: "text" }));
	}

	public async down(queryRunner: QueryRunner): Promise<void> {}
}
