import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteBotUsersWithoutAnApplication1761113394664 implements MigrationInterface {
    name = "DeleteBotUsersWithoutAnApplication1761113394664";
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM users WHERE bot = true AND id NOT IN (SELECT bot_user_id FROM applications);`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
