// different version of lambert-server instanceOf with discord error format

import { NextFunction, Request, Response } from "express";
import { Tuple } from "lambert-server";
import "missing-native-js-functions";

export const OPTIONAL_PREFIX = "$";
export const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function check(schema: any) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = instanceOf(schema, req.body, { path: "body", req, ref: { obj: null, key: "" } });
			if (result === true) return next();
			throw result;
		} catch (error) {
			return res.status(400).json({ code: 50035, message: "Invalid Form Body", success: false, errors: error });
		}
	};
}

export function FieldErrors(fields: Record<string, { code?: string; message: string }>) {
	return new FieldError(
		50035,
		"Invalid Form Body",
		fields.map(({ message, code }) => ({
			_errors: [
				{
					message,
					code: code || "BASE_TYPE_INVALID",
				},
			],
		}))
	);
}

export class FieldError extends Error {
	constructor(public code: string | number, public message: string, public errors?: any) {
		super(message);
	}
}

export class Email {
	constructor(public email: string) {}
	check() {
		return !!this.email.match(EMAIL_REGEX);
	}
}

export class Length {
	constructor(public type: any, public min: number, public max: number) {}

	check(value: string) {
		if (typeof value === "string" || Array.isArray(value)) return value.length >= this.min && value.length <= this.max;
		if (typeof value === "number" || typeof value === "bigint") return value >= this.min && value <= this.max;
		return false;
	}
}

export function instanceOf(
	type: any,
	value: any,
	{
		path = "",
		optional = false,
		errors = {},
		req,
		ref,
	}: { path?: string; optional?: boolean; errors?: any; req: Request; ref?: { key: string | number; obj: any } }
): Boolean {
	if (!ref) ref = { obj: null, key: "" };
	if (!path) path = "body";

	try {
		if (!type) return true; // no type was specified

		if (value == null) {
			if (optional) return true;
			throw new FieldError("BASE_TYPE_REQUIRED", req.t("common:field.BASE_TYPE_REQUIRED"));
		}

		switch (type) {
			case String:
				if (typeof value === "string") return true;
				throw new FieldError("BASE_TYPE_STRING", req.t("common:field.BASE_TYPE_STRING"));
			case Number:
				value = Number(value);
				ref.obj[ref.key] = value;
				if (typeof value === "number" && !isNaN(value)) return true;
				throw new FieldError("BASE_TYPE_NUMBER", req.t("common:field.BASE_TYPE_NUMBER"));
			case BigInt:
				try {
					value = BigInt(value);
					ref.obj[ref.key] = value;
					if (typeof value === "bigint") return true;
				} catch (error) {}
				throw new FieldError("BASE_TYPE_BIGINT", req.t("common:field.BASE_TYPE_BIGINT"));
			case Boolean:
				if (value == "true") value = true;
				if (value == "false") value = false;
				ref.obj[ref.key] = value;
				if (typeof value === "boolean") return true;
				throw new FieldError("BASE_TYPE_BOOLEAN", req.t("common:field.BASE_TYPE_BOOLEAN"));

			case Email:
				if (new Email(value).check()) return true;
				throw new FieldError("EMAIL_TYPE_INVALID_EMAIL", req.t("common:field.EMAIL_TYPE_INVALID_EMAIL"));
			case Date:
				value = new Date(value);
				ref.obj[ref.key] = value;
				// value.getTime() can be < 0, if it is before 1970
				if (!isNaN(value)) return true;
				throw new FieldError("DATE_TYPE_PARSE", req.t("common:field.DATE_TYPE_PARSE"));
		}

		if (typeof type === "object") {
			if (Array.isArray(type)) {
				if (!Array.isArray(value)) throw new FieldError("BASE_TYPE_ARRAY", req.t("common:field.BASE_TYPE_ARRAY"));
				if (!type.length) return true; // type array didn't specify any type

				return (
					value.every((val, i) => {
						errors[i] = {};
						return (
							instanceOf(type[0], val, {
								path: `${path}[${i}]`,
								optional,
								errors: errors[i],
								req,
								ref: { key: i, obj: value },
							}) === true
						);
					}) || errors
				);
			} else if (type?.constructor?.name != "Object") {
				if (type instanceof Tuple) {
					if ((<Tuple>type).types.some((x) => instanceOf(x, value, { path, optional, errors, req, ref }))) return true;
					throw new FieldError("BASE_TYPE_CHOICES", req.t("common:field.BASE_TYPE_CHOICES", { types: type.types }));
				} else if (type instanceof Length) {
					let length = <Length>type;
					if (instanceOf(length.type, value, { path, optional, req, ref, errors }) !== true) return errors;
					let val = ref.obj[ref.key];
					if ((<Length>type).check(val)) return true;
					throw new FieldError(
						"BASE_TYPE_BAD_LENGTH",
						req.t("common:field.BASE_TYPE_BAD_LENGTH", {
							length: `${type.min} - ${type.max}`,
						})
					);
				}
				if (value instanceof type) return true;
				throw new FieldError("BASE_TYPE_CLASS", req.t("common:field.BASE_TYPE_CLASS", { type }));
			}

			if (typeof value !== "object") throw new FieldError("BASE_TYPE_OBJECT", req.t("common:field.BASE_TYPE_OBJECT"));

			const diff = Object.keys(value).missing(
				Object.keys(type).map((x) => (x.startsWith(OPTIONAL_PREFIX) ? x.slice(OPTIONAL_PREFIX.length) : x))
			);

			if (diff.length) throw new FieldError("UNKOWN_FIELD", req.t("common:field.UNKOWN_FIELD", { key: diff }));

			return (
				Object.keys(type).every((key) => {
					let newKey = key;
					const OPTIONAL = key.startsWith(OPTIONAL_PREFIX);
					if (OPTIONAL) newKey = newKey.slice(OPTIONAL_PREFIX.length);
					errors[newKey] = {};

					return (
						instanceOf(type[key], value[newKey], {
							path: `${path}.${newKey}`,
							optional: OPTIONAL,
							errors: errors[newKey],
							req,
							ref: { key: newKey, obj: value },
						}) === true
					);
				}) || errors
			);
		} else if (typeof type === "number" || typeof type === "string" || typeof type === "boolean") {
			if (value === type) return true;
			throw new FieldError("BASE_TYPE_CONSTANT", req.t("common:field.BASE_TYPE_CONSTANT", { value: type }));
		} else if (typeof type === "bigint") {
			if (BigInt(value) === type) return true;
			throw new FieldError("BASE_TYPE_CONSTANT", req.t("common:field.BASE_TYPE_CONSTANT", { value: type }));
		}

		return type == value;
	} catch (error) {
		let e = error as FieldError;
		errors._errors = [{ message: e.message, code: e.code }];
		return errors;
	}
}
