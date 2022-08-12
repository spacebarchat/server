import "reflect-metadata";
import { BaseEntity, ObjectIdColumn, PrimaryColumn, SaveOptions } from "typeorm";
import { Snowflake } from "../util/Snowflake";

export class BaseClassWithoutId extends BaseEntity {
	constructor() {
		super();
	}
}

export const PrimaryIdColumn = process.env.DATABASE?.startsWith("mongodb") ? ObjectIdColumn : PrimaryColumn;

export class BaseClass extends BaseClassWithoutId {
	@PrimaryIdColumn()
	id: string;

	constructor() {
		super();
		if (!this.id) this.id = Snowflake.generate();
	}

	save(options?: SaveOptions | undefined): Promise<this> {
		if (!this.id) this.id = Snowflake.generate();
		return super.save(options);
	}
}
