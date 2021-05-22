import "missing-native-js-functions";
import envPaths from "env-paths";
import path from "path";
import { JSONSchemaType, ValidateFunction } from "ajv"
import fs from 'fs'
import dotProp from "dot-prop";

interface Options<T> {
	path: string;
	schemaValidator: ValidateFunction;
	schema: JSONSchemaType<T>;
}

type Deserialize<T> = (text: string) => T;

function getConfigPath(name: string, configFileName: string, extension: string): string {
	const configEnvPath = envPaths(name, { suffix: "" }).config;
	const configPath = path.resolve(configEnvPath, `${configFileName}${extension}`)
	return configPath
}

class Store<T extends Record<string, any> = Record<string, unknown>> implements Iterable<[keyof T, T[keyof T]]>{
	readonly path: string;
	readonly validator: ValidateFunction;
	readonly schema: string;

	constructor(path: string, validator: ValidateFunction, schema: JSONSchemaType<T>) {
		this.validator = validator;
		if (fs.existsSync(path)) {
			this.path = path
		} else {
			this._ensureDirectory()
		}
	}

	private readonly _deserialize: Deserialize<T> = value => JSON.parse(value);

	private _ensureDirectory(): void {
		fs.mkdirSync(path.dirname(this.path), { recursive: true })
	}

	protected _validate(data: T | unknown): void {
		const valid = this.validator(data);
		if (valid || !this.validator.errors) {
			return;
		}

		const errors = this.validator.errors.map(({ instancePath, message = '' }) => `\`${instancePath.slice(1)}\` ${message}`);
		throw new Error("The configuration schema was violated!: " + errors.join('; '))

	}

	*[Symbol.iterator](): IterableIterator<[keyof T, T[keyof T]]> {
		for (const [key, value] of Object.entries(this.store)) {
			yield [key, value]
		}
	}

	public get store(): T {
		try {
			const data = fs.readFileSync(this.path).toString();
			const deserializedData = this._deserialize(data);
			this._validate(deserializedData);
			return Object.assign(Object.create(null), deserializedData);
		} catch (error) {
			if (error == 'ENOENT') {
				this._ensureDirectory();
				throw new Error("Critical, config store does not exist, the base directory has been created, copy the necessary config files to the directory");
			}

			throw error;
		}

	}
}

class Config<T extends Record<string, any> = Record<string, unknown>> extends Store<T> implements Iterable<[keyof T, T[keyof T]]> {
	constructor(options: Readonly<Partial<Options<T>>>) {
		super(options.path!, options.schemaValidator!, options.schema!);

		this._validate(this.store);

	}

	public get<Key extends keyof T>(key: Key): T[Key];
	public get<Key extends keyof T>(key: Key, defaultValue: Required<T>[Key]): Required<T>[Key];
	public get<Key extends string, Value = unknown>(key: Exclude<Key, keyof T>, defaultValue?: Value): Value;
	public get(key: string, defaultValue?: unknown): unknown {
		return this._get(key, defaultValue);
	}

	public getAll(): unknown {
		return this.store as unknown;
	}

	private _has<Key extends keyof T>(key: Key | string): boolean {
		return dotProp.has(this.store, key as string);
	}

	private _get<Key extends keyof T>(key: Key): T[Key] | undefined;
	private _get<Key extends keyof T, Default = unknown>(key: Key, defaultValue: Default): T[Key] | Default;
	private _get<Key extends keyof T, Default = unknown>(key: Key | string, defaultValue?: Default): Default | undefined {
		if (!this._has(key)) {
			throw new Error("Tried to acess a non existant property in the config");
		}

		return dotProp.get<T[Key] | undefined>(this.store, key as string, defaultValue as T[Key]);
	}

}

export default Config;

