import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveAuditLogTargetFK1788380367585 implements MigrationInterface {
    name = "RemoveAuditLogTargetFK1788380367585";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_audit_log_target_user_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_audit_log_target_user_id" FOREIGN KEY ("target_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }
}