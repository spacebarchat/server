import "missing-native-js-functions";
import { NextFunction, Request, Response } from "express";
import { HTTPError } from ".";

const OPTIONAL_PREFIX = "$";
const EMAIL_REGEX =
	/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function check(schema: any) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = instanceOf(schema, req.body, { path: "body" });
			if (result === true) return next();
			throw result;
		} catch (error) {
			next(new HTTPError((error as any).toString(), 400));
		}
	};
}

export class Tuple {
	public types: any[];
	constructor(...types: any[]) {
		this.types = types;
	}
}

export class Email {
	constructor(public email: string) {}
	check() {
		return !!this.email.match(EMAIL_REGEX);
	}
}

export function instanceOf(
	type: any,
	value: any,
	{ path = "", optional = false }: { path?: string; optional?: boolean } = {}
): Boolean {
	if (!type) return true; // no type was specified

	if (value == null) {
		if (optional) return true;
		throw `${path} is required`;
	}

	switch (type) {
		case String:
			if (typeof value === "string") return true;
			throw `${path} must be a string`;
		case Number:
			value = Number(value);
			if (typeof value === "number" && !isNaN(value)) return true;
			throw `${path} must be a number`;
		case BigInt:
			try {
				value = BigInt(value);
				if (typeof value === "bigint") return true;
			} catch (error) {}
			throw `${path} must be a bigint`;
		case Boolean:
			if (value == "true") value = true;
			if (value == "false") value = false;
			if (typeof value === "boolean") return true;
			throw `${path} must be a boolean`;
		case Object:
			if (typeof value === "object" && value !== null) return true;
			throw `${path} must be a object`;
	}

	if (typeof type === "object") {
		if (Array.isArray(type)) {
			if (!Array.isArray(value)) throw `${path} must be an array`;
			if (!type.length) return true; // type array didn't specify any type

			return value.every((val, i) => instanceOf(type[0], val, { path: `${path}[${i}]`, optional }));
		}
		if (type?.constructor?.name != "Object") {
			if (type instanceof Tuple) {
				if (
					(<Tuple>type).types.some((x) => {
						try {
							return instanceOf(x, value, { path, optional });
						} catch (error) {
							return false;
						}
					})
				) {
					return true;
				}
				throw `${path} must be one of ${type.types}`;
			}
			if (type instanceof Email) {
				if ((<Email>type).check()) return true;
				throw `${path} is not a valid E-Mail`;
			}
			if (value instanceof type) return true;
			throw `${path} must be an instance of ${type}`;
		}
		if (typeof value !== "object") throw `${path} must be a object`;

		const diff = Object.keys(value).missing(
			Object.keys(type).map((x) => (x.startsWith(OPTIONAL_PREFIX) ? x.slice(OPTIONAL_PREFIX.length) : x))
		);

		if (diff.length) throw `Unkown key ${diff}`;

		return Object.keys(type).every((key) => {
			let newKey = key;
			const OPTIONAL = key.startsWith(OPTIONAL_PREFIX);
			if (OPTIONAL) newKey = newKey.slice(OPTIONAL_PREFIX.length);

			return instanceOf(type[key], value[newKey], {
				path: `${path}.${newKey}`,
				optional: OPTIONAL,
			});
		});
	} else if (typeof type === "number" || typeof type === "string" || typeof type === "boolean") {
		if (value === type) return true;
		throw `${path} must be ${value}`;
	} else if (typeof type === "bigint") {
		if (BigInt(value) === type) return true;
		throw `${path} must be ${value}`;
	}

	return type == value;
}
