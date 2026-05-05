import { Raw } from "typeorm";

export function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
}

export function emailMatches(email: string) {
    return Raw((alias) => `LOWER(TRIM(${alias})) = :email`, {
        email: normalizeEmail(email),
    });
}
