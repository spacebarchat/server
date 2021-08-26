import "reflect-metadata";
import { BaseEntity, BeforeInsert, BeforeUpdate, PrimaryColumn } from "typeorm";
import { Snowflake } from "../util/Snowflake";
import Ajv, { ValidateFunction } from "ajv";
import schema from "./schema.json";

const ajv = new Ajv({
	removeAdditional: "all",
	useDefaults: true,
	coerceTypes: true,
	// @ts-ignore
	validateFormats: false,
	allowUnionTypes: true,
});
// const validator = ajv.compile<BaseClass>(schema);

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

		for (const key in props) {
			if (this.hasOwnProperty(key)) continue;

			Object.defineProperty(this, key, { value: props[key] });
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
