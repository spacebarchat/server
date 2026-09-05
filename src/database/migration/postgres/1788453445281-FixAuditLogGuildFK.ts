import { MigrationInterface, QueryRunner } from "typeorm";

export class FixAuditLogGuildFK1788453445281 implements MigrationInterface {
    name = "FixAuditLogGuildFK1788453445281";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_audit_log_guild_id"`);
        await queryRunner.query(
            `ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_audit_log_guild_id" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_audit_log_guild_id"`);
        await queryRunner.query(
            `ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_audit_log_guild_id" FOREIGN KEY ("target_id") REFERENCES "guilds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }
}