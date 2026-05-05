import { MigrationInterface, QueryRunner } from "typeorm";

type DuplicateEmail = {
    normalized_email: string;
    ids: string[];
};

export class NormalizeUserEmails1777999500000 implements MigrationInterface {
    name = "NormalizeUserEmails1777999500000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        const duplicates = (await queryRunner.query(`
            SELECT LOWER(TRIM(email)) AS normalized_email, ARRAY_AGG(id ORDER BY id) AS ids
            FROM users
            WHERE email IS NOT NULL AND TRIM(email) <> ''
            GROUP BY LOWER(TRIM(email))
            HAVING COUNT(*) > 1;
        `)) as DuplicateEmail[];

        if (duplicates.length) {
            const conflicts = duplicates.map(({ normalized_email, ids }) => `${normalized_email}: ${ids.join(", ")}`).join("; ");
            throw new Error(`Cannot normalize user emails while case-insensitive duplicates exist. Resolve these users manually first: ${conflicts}`);
        }

        await queryRunner.query(`UPDATE users SET email = NULL WHERE email IS NOT NULL AND TRIM(email) = '';`);
        await queryRunner.query(`UPDATE users SET email = LOWER(TRIM(email)) WHERE email IS NOT NULL;`);
        await queryRunner.query(`CREATE UNIQUE INDEX users_email_normalized_idx ON users (LOWER(TRIM(email))) WHERE email IS NOT NULL;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX users_email_normalized_idx;`);
    }
}
