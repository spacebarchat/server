import "reflect-metadata";
import {
	BaseEntity,
	BeforeInsert,
	BeforeUpdate,
	EntityMetadata,
	FindConditions,
	getConnection,
	PrimaryColumn,
	RemoveOptions,
} from "typeorm";
import { Snowflake } from "../util/Snowflake";
import "missing-native-js-functions";

// TODO use class-validator https://typeorm.io/#/validation with class annotators (isPhone/isEmail) combined with types from typescript-json-schema
// btw. we don't use class-validator for everything, because we need to explicitly set the type instead of deriving it from typescript also it doesn't easily support nested objects

export class BaseClassWithoutId extends BaseEntity {
	constructor(private props?: any) {
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

	static async delete<T>(criteria: FindConditions<T>, options?: RemoveOptions) {
		if (!criteria) throw new Error("You need to specify delete criteria");

		const repository = this.getRepository();
		const promises = repository.metadata.relations.map(async (x) => {
			if (x.orphanedRowAction !== "delete") return;
			if (typeof x.type === "string") return;

			const foreignKey =
				x.foreignKeys.find((key) => key.entityMetadata === repository.metadata) ||
				x.inverseRelation?.foreignKeys[0]; // find foreign key for this entity
			if (!foreignKey) {
				throw new Error(
					`Foreign key not found for entity ${repository.metadata.name} in relation ${x.propertyName}`
				);
			}
			const id = (criteria as any)[foreignKey.referencedColumnNames[0]];
			if (!id) throw new Error("id missing in criteria options");

			if (x.relationType === "many-to-many") {
				return getConnection()
					.createQueryBuilder()
					.relation(this, x.propertyName)
					.of(id)
					.remove({ [foreignKey.columnNames[0]]: id });
			} else if (
				x.relationType === "one-to-one" ||
				x.relationType === "many-to-one" ||
				x.relationType === "one-to-many"
			) {
				return getConnection()
					.getRepository(x.inverseEntityMetadata.target)
					.delete({ [foreignKey.columnNames[0]]: id });
			}
		});
		await Promise.all(promises);
		return super.delete(criteria, options);
	}
}

export class BaseClass extends BaseClassWithoutId {
	@PrimaryColumn()
	id: string;

	assign(props: any = {}) {
		super.assign(props);
		if (!this.id) this.id = Snowflake.generate();
		return this;
	}
}
