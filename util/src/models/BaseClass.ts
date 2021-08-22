import "reflect-metadata";
import { BaseEntity, BeforeInsert, BeforeUpdate, Column, PrimaryGeneratedColumn } from "typeorm";
import { Snowflake } from "../util/Snowflake";
import { IsString, validateOrReject } from "class-validator";

export class BaseClass extends BaseEntity {
	@PrimaryGeneratedColumn()
	@Column()
	@IsString()
	id: string;

	constructor(props?: any, opts: { id?: string } = {}) {
		super();
		this.id = opts.id || Snowflake.generate();
		Object.defineProperties(this, props);
	}

	@BeforeUpdate()
	@BeforeInsert()
	async validate() {
		await validateOrReject(this, {});
	}
}

// @ts-ignore
global.BaseClass = BaseClass;

var test = new BaseClass({});

setTimeout(() => {}, 10000 * 1000);
