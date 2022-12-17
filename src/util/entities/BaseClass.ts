import "reflect-metadata";
import {
	BaseEntity,
	BeforeInsert,
	BeforeUpdate,
	DeepPartial,
	FindOptionsWhere,
	ObjectIdColumn,
	PrimaryColumn,
} from "typeorm";
import { Snowflake } from "../util/Snowflake";
import "missing-native-js-functions";
import { getDatabase } from "..";
import { OrmUtils } from "@fosscord/util";

export class BaseClassWithoutId extends BaseEntity {
	private get construct(): any {
		return this.constructor;
	}

	private get metadata() {
		return getDatabase()?.getMetadata(this.construct);
	}

	assign(props: any) {
		OrmUtils.mergeDeep(this, props);
		return this;
	}

	toJSON(): any {
		return Object.fromEntries(
			this.metadata!.columns // @ts-ignore
				.map((x) => [x.propertyName, this[x.propertyName]])
				.concat(
					// @ts-ignore
					this.metadata.relations.map((x) => [
						x.propertyName,
						// @ts-ignore
						this[x.propertyName],
					]),
				),
		);
	}

	static increment<T extends BaseClass>(
		conditions: FindOptionsWhere<T>,
		propertyPath: string,
		value: number | string,
	) {
		const repository = this.getRepository();
		return repository.increment(conditions, propertyPath, value);
	}

	static decrement<T extends BaseClass>(
		conditions: FindOptionsWhere<T>,
		propertyPath: string,
		value: number | string,
	) {
		const repository = this.getRepository();
		return repository.decrement(conditions, propertyPath, value);
	}
}

export const PrimaryIdColumn = process.env.DATABASE?.startsWith("mongodb")
	? ObjectIdColumn
	: PrimaryColumn;

export class BaseClass extends BaseClassWithoutId {
	@PrimaryIdColumn()
	id: string = Snowflake.generate();

	@BeforeUpdate()
	@BeforeInsert()
	_do_validate() {
		if (!this.id) this.id = Snowflake.generate();
	}
}
