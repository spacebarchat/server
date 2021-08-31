import "reflect-metadata";
import { BaseEntity, BeforeInsert, BeforeUpdate, EntityMetadata, FindConditions, PrimaryColumn } from "typeorm";
import { Snowflake } from "../util/Snowflake";
import "missing-native-js-functions";

// TODO use class-validator https://typeorm.io/#/validation with class annotators (isPhone/isEmail) combined with types from typescript-json-schema
// btw. we don't use class-validator for everything, because we need to explicitly set the type instead of deriving it from typescript also it doesn't easily support nested objects

export class BaseClass extends BaseEntity {
	@PrimaryColumn()
	id: string = Snowflake.generate();

	// @ts-ignore
	constructor(public props?: any) {
		super();
		this.assign(props);
	}

	get construct(): any {
		return this.constructor;
	}

	get metadata() {
		return this.construct.getRepository().metadata as EntityMetadata;
	}

	assign(props: any) {
		if (!props || typeof props !== "object") return;
		delete props.opts;
		delete props.props;

		const properties = new Set(
			this.metadata.columns
				.map((x: any) => x.propertyName)
				.concat(this.metadata.relations.map((x) => x.propertyName))
		);
		// will not include relational properties

		for (const key in props) {
			if (!properties.has(key)) continue;
			// @ts-ignore
			const setter = this[`set${key.capitalize()}`];

			if (setter) {
				setter.call(this, props[key]);
			} else {
				// @ts-ignore
				this[key] = props[key];
			}
		}
	}

	@BeforeUpdate()
	@BeforeInsert()
	validate() {
		this.assign(this.props);
		return this;
	}

	toJSON(): any {
		return Object.fromEntries(
			this.metadata.columns // @ts-ignore
				.map((x) => [x.propertyName, this[x.propertyName]]) // @ts-ignore
				.concat(this.metadata.relations.map((x) => [x.propertyName, this[x.propertyName]]))
		);
	}

	static increment<T extends BaseClass>(conditions: FindConditions<T>, propertyPath: string, value: number | string) {
		const repository = this.getRepository();
		return repository.increment(conditions, propertyPath, value);
	}

	static decrement<T extends BaseClass>(conditions: FindConditions<T>, propertyPath: string, value: number | string) {
		const repository = this.getRepository();
		return repository.decrement(conditions, propertyPath, value);
	}
}
