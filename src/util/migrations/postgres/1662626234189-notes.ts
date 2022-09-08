import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class notes1662626234189 implements MigrationInterface {
    name = 'notes1662626234189'

    public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn("users", "notes");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn("users", new TableColumn({ name: "notes", type: "simple-json" }));
    }

}
