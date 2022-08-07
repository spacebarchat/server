import "reflect-metadata";
import { BaseEntity, EntityMetadata, ObjectIdColumn, PrimaryColumn, FindOptionsWhere } from "typeorm";
import { Snowflake } from "../util/Snowflake";

export class BaseClassWithoutId extends BaseEntity {
	constructor(props?: any) {
		super();
		this.assign(props);
	}

	assign(props: any = {}) {
		//console.log(`assign (${typeof this})...`)
		delete props.opts;
		delete props.props;
		// will not include relational properties

		for (const key in props) {
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
