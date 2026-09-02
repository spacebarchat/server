import { MigrationInterface, QueryRunner } from "typeorm";

export class AuditLogsByGuild1788342958702 implements MigrationInterface {
    name = "AuditLogsByGuild1788342958702";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "guild_id" character varying`);
        await queryRunner.query(`CREATE INDEX "IDX_audit_log_guild_id" ON "audit_logs"  ("guild_id") `);
        await queryRunner.query(
            `ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_audit_log_guild_id" FOREIGN KEY ("target_id") REFERENCES "guilds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_audit_log_guild_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_audit_log_guild_id"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "guild_id"`);
    }
}
