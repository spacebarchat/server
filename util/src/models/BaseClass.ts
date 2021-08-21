import "reflect-metadata";
import { BaseEntity, Column } from "typeorm";

export class BaseClass extends BaseEntity {
	@Column()
	id?: string;

	constructor(props?: any) {
		super();
		BaseClass.assign(props, this, "body.");
	}

	private static assign(props: any, object: any, path?: string): any {
		const expectedType = Reflect.getMetadata("design:type", object, props);
		console.log(expectedType, object, props, path, typeof object);

		if (typeof object !== typeof props) throw new Error(`Property at ${path} must be`);
		if (typeof object === "object")
			return Object.keys(object).map((key) => BaseClass.assign(props[key], object[key], `${path}.${key}`));
	}
}

// @ts-ignore
global.BaseClass = BaseClass;

var test = new BaseClass({});

setTimeout(() => {}, 10000 * 1000);
