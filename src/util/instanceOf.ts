// different version of lambert-server instanceOf with discord error format

import { NextFunction, Request, Response } from "express";
import { Tuple } from "lambert-server";

const OPTIONAL_PREFIX = "$";

export function check(schema: any) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = instanceOf(schema, req.body, { path: "body" });
			if (result === true) return next();
			throw result;
		} catch (error) {
			return res.status(400).json({ code: 50035, message: "Invalid Form Body", success: false, errors: error });
		}
	};
}

class FieldError extends Error {
	constructor(public code: string, public message: string) {
		super(message);
	}
}

export function instanceOf(
	type: any,
	value: any,
	{ path = "", optional = false, errors = {} }: { path?: string; optional?: boolean; errors?: any } = {}
): Boolean {
	try {
		if (!type) return true; // no type was specified

		if (value == null) {
			if (optional) return true;
			throw new FieldError("BASE_TYPE_REQUIRED", `This field is required`);
		}

		switch (type) {
			case String:
				if (typeof value === "string") return true;
				throw new FieldError("BASE_TYPE_STRING", `This field must be a string`);
			case Number:
				value = Number(value);
				if (typeof value === "number" && !isNaN(value)) return true;
				throw new FieldError("BASE_TYPE_NUMBER", `This field must be a number`);
			case BigInt:
				try {
					value = BigInt(value);
					if (typeof value === "bigint") return true;
				} catch (error) {}
				throw new FieldError("BASE_TYPE_BIGINT", `This field must be a bigint`);
			case Boolean:
				if (value == "true") value = true;
				if (value == "false") value = false;
				if (typeof value === "boolean") return true;
				throw new FieldError("BASE_TYPE_BOOLEAN", `This field must be a boolean`);
		}

		if (typeof type === "object") {
			if (type?.constructor?.name != "Object") {
				if (type instanceof Tuple) {
					if ((<Tuple>type).types.some((x) => instanceOf(x, value, { path, optional, errors }))) return true;
					throw new FieldError("BASE_TYPE_CHOICES", `This field must be one of (${type.types})`);
				}
				if (value instanceof type) return true;
				throw new FieldError("BASE_TYPE_CLASS", `This field must be an instance of ${type}`);
			}
			if (typeof value !== "object") throw new FieldError("BASE_TYPE_OBJECT", `This field must be a object`);

			if (Array.isArray(type)) {
				if (!Array.isArray(value)) throw new FieldError("BASE_TYPE_ARRAY", `This field must be an array`);
				if (!type.length) return true; // type array didn't specify any type

				return (
					value.every((val, i) => {
						errors[i] = {};
						return (
							instanceOf(type[0], val, { path: `${path}[${i}]`, optional, errors: errors[i] }) === true
						);
					}) || errors
				);
			}

			const diff = Object.keys(value).missing(
				Object.keys(type).map((x) => (x.startsWith(OPTIONAL_PREFIX) ? x.slice(OPTIONAL_PREFIX.length) : x))
			);

			if (diff.length) throw new FieldError("UNKOWN_FIELD", `Unkown key ${diff}`);

			return (
				Object.keys(type).every((key) => {
					let newKey = key;
					const OPTIONAL = key.startsWith(OPTIONAL_PREFIX);
					if (OPTIONAL) newKey = newKey.slice(OPTIONAL_PREFIX.length);
					errors[key] = {};

					return (
						instanceOf(type[key], value[newKey], {
							path: `${path}.${newKey}`,
							optional: OPTIONAL,
							errors: errors[key],
						}) === true
					);
				}) || errors
			);
		} else if (typeof type === "number" || typeof type === "string" || typeof type === "boolean") {
			if (value === type) return true;
			throw new FieldError("BASE_TYPE_CONSTANT", `This field must be ${value}`);
		} else if (typeof type === "bigint") {
			if (BigInt(value) === type) return true;
			throw new FieldError("BASE_TYPE_CONSTANT", `This field must be ${value}`);
		}

		return type == value;
	} catch (error) {
		let e = error as FieldError;
		errors._errors = [{ message: e.message, code: e.code }];
		return errors;
	}
}
