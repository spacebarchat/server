import { Raw } from "typeorm";
import { FieldErrors } from "./FieldError";

export const POSTGRES_JS_TRIM_WHITESPACE =
    "U&'\\0009\\000A\\000B\\000C\\000D\\0020\\00A0\\1680\\2000\\2001\\2002\\2003\\2004\\2005\\2006\\2007\\2008\\2009\\200A\\2028\\2029\\202F\\205F\\3000\\FEFF'";
export const USERS_EMAIL_NORMALIZED_INDEX = "users_email_normalized_idx";

type DatabaseError = {
    code?: string;
    constraint?: string;
    driverError?: {
        code?: string;
        constraint?: string;
    };
};

export function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
}

export function normalizeOptionalEmail(email: string | null | undefined) {
    if (email == null) return undefined;

    const normalized = normalizeEmail(email);
    return normalized || undefined;
}

export function normalizedEmailSqlExpression(alias: string) {
    return `LOWER(BTRIM(${alias}, ${POSTGRES_JS_TRIM_WHITESPACE}))`;
}

export function emailMatches(email: string) {
    return Raw((alias) => `${normalizedEmailSqlExpression(alias)} = :email`, {
        email: normalizeEmail(email),
    });
}

export function isNormalizedEmailUniqueViolation(error: unknown) {
    const databaseError = error as DatabaseError | undefined;
    const driverError = databaseError?.driverError;

    return (
        (databaseError?.code === "23505" || driverError?.code === "23505") &&
        (databaseError?.constraint === USERS_EMAIL_NORMALIZED_INDEX || driverError?.constraint === USERS_EMAIL_NORMALIZED_INDEX)
    );
}

export function emailAlreadyRegisteredFieldError(message = "Email is already registered") {
    return FieldErrors({
        email: {
            code: "EMAIL_ALREADY_REGISTERED",
            message,
        },
    });
}
