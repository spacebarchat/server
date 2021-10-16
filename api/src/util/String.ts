import { Request } from "express";
import { ntob } from "./Base64";
import { FieldErrors } from "@fosscord/util";

export function checkLength(str: string, min: number, max: number, key: string, req: Request) {
	if (str.length < min || str.length > max) {
		throw FieldErrors({
			[key]: {
				code: "BASE_TYPE_BAD_LENGTH",
				message: req.t("common:field.BASE_TYPE_BAD_LENGTH", { length: `${min} - ${max}` })
			}
		});
	}
}

export function generateCode() {
	return ntob(Date.now() + Math.randomIntBetween(0, 10000));
}
