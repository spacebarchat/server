import { MigrationInterface, QueryRunner } from "typeorm";

export class Int8PrimaryKeysTeams1776178642010 implements MigrationInterface {
    name = "Int8PrimaryKeysTeams1776178642010";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "int8");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.convertPks(queryRunner, "varchar");
    }

    private async convertPks(queryRunner: QueryRunner, to: string) {
        // teams
        // -> applications
        await queryRunner.query(`ALTER TABLE applications DROP CONSTRAINT "FK_a36ed02953077f408d0f3ebc424";`); //team_id
        await queryRunner.query(`ALTER TABLE applications ALTER COLUMN team_id TYPE ${to} USING team_id::${to}`);
        // -> team_members
        await queryRunner.query(`ALTER TABLE team_members DROP CONSTRAINT "FK_fdad7d5768277e60c40e01cdcea";`); //team_id
        await queryRunner.query(`ALTER TABLE team_members ALTER COLUMN team_id TYPE ${to} USING team_id::${to}`);
        // and finally, cleanup
        await queryRunner.query(`ALTER TABLE teams ALTER COLUMN id TYPE ${to} USING id::${to};`);
        await queryRunner.query(`ALTER TABLE public.applications ADD CONSTRAINT "FK_a36ed02953077f408d0f3ebc424" FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE public.team_members ADD CONSTRAINT "FK_fdad7d5768277e60c40e01cdcea" FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;`);
    }
}
