/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Request } from "express";
import { SPECIAL_CHAR } from "@spacebar/util/util/Regex";
import { Random, ntob } from "@spacebar/extensions";
import { FieldErrors } from "@spacebar/util/util/FieldError";

export function trimSpecial(str?: string): string {
    if (!str) return "";
    return str.replace(SPECIAL_CHAR, "").trim();
}

/**
 * Capitalizes the first letter of a string.
 * @param str The string to capitalize.
 * @returns The capitalized string.
 */
export function capitalize(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function centerString(str: string, len: number): string {
    const pad = len - str.length;
    const padLeft = Math.floor(pad / 2) + str.length;
    return str.padStart(padLeft).padEnd(len);
}

export function stringGlobToRegexp(str: string, flags?: string): RegExp {
    // Convert simple wildcard patterns to regex
    const escaped = str.replace(".", "\\.").replace("?", ".").replace("*", ".*");
    return new RegExp(escaped, flags);
}

// TODO: use exception type
export function stringCheckLength(str: string, min: number, max: number, key: string, req: Request) {
    if (str.length < min || str.length > max) {
        throw FieldErrors({
            [key]: {
                code: "BASE_TYPE_BAD_LENGTH",
                // TODO: remove dependency on request (add generic field?)
                message: req.t("common:field.BASE_TYPE_BAD_LENGTH", {
                    length: `${min} - ${max}`,
                }),
            },
        });
    }
}

export function generateCode() {
    return ntob(Date.now() + Random.nextInt(0, 10000));
}
