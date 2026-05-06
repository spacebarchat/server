import { MigrationInterface, QueryRunner } from "typeorm";

const POSTGRES_JS_TRIM_WHITESPACE =
    "U&'\\0009\\000A\\000B\\000C\\000D\\0020\\00A0\\1680\\2000\\2001\\2002\\2003\\2004\\2005\\2006\\2007\\2008\\2009\\200A\\2028\\2029\\202F\\205F\\3000\\FEFF'";
const USERS_EMAIL_NORMALIZED_INDEX = "users_email_normalized_idx";

function normalizedMigrationEmailSqlExpression(alias: string) {
    return `LOWER(BTRIM(${alias}, ${POSTGRES_JS_TRIM_WHITESPACE}))`;
}

type DuplicateEmail = {
    normalized_email: string;
    ids: string[];
};

export class NormalizeUserEmails1777999500000 implements MigrationInterface {
    name = "NormalizeUserEmails1777999500000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        const normalizedEmail = normalizedMigrationEmailSqlExpression("email");

        const duplicates = (await queryRunner.query(`
            SELECT ${normalizedEmail} AS normalized_email, ARRAY_AGG(id ORDER BY id) AS ids
            FROM users
            WHERE email IS NOT NULL AND ${normalizedEmail} <> ''
            GROUP BY ${normalizedEmail}
            HAVING COUNT(*) > 1;
        `)) as DuplicateEmail[];

        if (duplicates.length) {
            const conflicts = duplicates.map(({ normalized_email, ids }) => `${normalized_email}: ${ids.join(", ")}`).join("; ");
            throw new Error(`Cannot normalize user emails while case-insensitive duplicates exist. Resolve these users manually first: ${conflicts}`);
        }

        await queryRunner.query(`UPDATE users SET email = NULL WHERE email IS NOT NULL AND ${normalizedEmail} = '';`);
        await queryRunner.query(`UPDATE users SET email = ${normalizedEmail} WHERE email IS NOT NULL;`);
        await queryRunner.query(`CREATE UNIQUE INDEX ${USERS_EMAIL_NORMALIZED_INDEX} ON users (${normalizedEmail}) WHERE email IS NOT NULL;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX ${USERS_EMAIL_NORMALIZED_INDEX};`);
    }
}
