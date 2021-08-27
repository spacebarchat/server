import "reflect-metadata";
import { BaseEntity, BeforeInsert, BeforeUpdate, PrimaryColumn } from "typeorm";
import { Snowflake } from "../util/Snowflake";
import Ajv, { ValidateFunction } from "ajv";
import schema from "./schema.json";
import "missing-native-js-functions";

// TODO use class-validator https://typeorm.io/#/validation with class annotators (isPhone/isEmail) combined with types from typescript-json-schema
// btw. we don't use class-validator for everything, because we need to explicitly set the type instead of deriving it from typescript also it doesn't easily support nested objects

const ajv = new Ajv({
	removeAdditional: "all",
	useDefaults: true,
	coerceTypes: true,
	// @ts-ignore
	validateFormats: false,
	allowUnionTypes: true,
});

export class BaseClass extends BaseEntity {
	@PrimaryColumn()
	id: string;

	// @ts-ignore
	constructor(props?: any, public opts: { id?: string } = {}) {
		super();
		this.assign(props);

		if (!this.construct.schema) {
			this.construct.schema = ajv.compile({ ...schema, $ref: `#/definitions/${this.construct.name}` });
		}

		this.id = this.opts.id || Snowflake.generate();
	}

	get construct(): any {
		return this.constructor;
	}

	get metadata() {
		return this.construct.getRepository().metadata;
	}

	assign(props: any) {
		if (!props || typeof props !== "object") return;

		delete props.opts;

		const properties = new Set(this.metadata.columns.map((x: any) => x.propertyName));
		// will not include relational properties (e.g. @RelationId @ManyToMany)

		for (const key in props) {
			if (this.hasOwnProperty(key)) continue;
			if (!properties.has(key)) continue;
			// @ts-ignore
			const setter = this[`set${key.capitalize()}`];

			if (setter) {
				setter.call(this, props[key]);
			} else {
				Object.defineProperty(this, key, { value: props[key] });
			}
		}
	}

	@BeforeUpdate()
	@BeforeInsert()
	validate() {
		const valid = this.construct.schema(this.toJSON());
		if (!valid) throw ajv.errors;
		return this;
	}

	toJSON(): any {
		// @ts-ignore
		return Object.fromEntries(this.metadata.columns.map((x) => [x.propertyName, this[x.propertyName]]));
	}
}
