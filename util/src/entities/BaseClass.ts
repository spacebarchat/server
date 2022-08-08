import "reflect-metadata";
import { BaseEntity, EntityMetadata, ObjectIdColumn, PrimaryColumn, FindOptionsWhere, Generated, SaveOptions } from "typeorm";
import { Snowflake } from "../util/Snowflake";

export class BaseClassWithoutId extends BaseEntity {
	constructor(props?: any) {
		super();
		if(props != undefined && props != null && Object.keys(props).length > 0)
			this.assign(props);
	}

	assign(props: any = {}) {
		//console.log(`assign (${typeof this})...`)
		delete props.opts;
		delete props.props;
		// will not include relational properties
		console.warn("WARNING: BaseClass.assign called! This will probably fail!");
		console.warn(this)
		Object.assign(this,props);
		if(/--debug|--inspect/.test(process.execArgv.join(' '))) debugger;
		/*for (const key in props) {
			// @ts-ignore
			const setter = this[`set${key.capitalize()}`]; // use setter function if it exists

			if (setter) {
				setter.call(this, props[key]);
			} else {
				// @ts-ignore
				this[key] = props[key];
			}
		}*/
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

	save(options?: SaveOptions | undefined): Promise<this> {
		if (!this.id) this.id = Snowflake.generate();
		return super.save(options);
	}
}
