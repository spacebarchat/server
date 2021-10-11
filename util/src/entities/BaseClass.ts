import "reflect-metadata";
import { BaseEntity, EntityMetadata, FindConditions, ObjectIdColumn, PrimaryColumn } from "typeorm";
import { Snowflake } from "../util/Snowflake";
import "missing-native-js-functions";

export class BaseClassWithoutId extends BaseEntity {
	constructor(props?: any) {
		super();
		this.assign(props);
	}

	private get construct(): any {
		return this.constructor;
	}

	private get metadata() {
		return this.construct.getRepository().metadata as EntityMetadata;
	}

	assign(props: any = {}) {
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
			const setter = this[`set${key.capitalize()}`]; // use setter function if it exists

			if (setter) {
				setter.call(this, props[key]);
			} else {
				// @ts-ignore
				this[key] = props[key];
			}
		}
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

export const PrimaryIdColumn = process.env.DATABASE?.startsWith("mongodb") ? ObjectIdColumn : PrimaryColumn;

export class BaseClass extends BaseClassWithoutId {
	@PrimaryIdColumn()
	id: string;

	assign(props: any = {}) {
		super.assign(props);
		if (!this.id) this.id = Snowflake.generate();
		return this;
	}
}
