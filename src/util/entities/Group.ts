import { Column, Entity } from "typeorm";

import { BaseClass } from "./BaseClass";

@Entity("groups")
export class UserGroup extends BaseClass {
	@Column({ nullable: true })
	parent?: BigInt;

	@Column()
	color: number;

	@Column()
	hoist: boolean;

	@Column()
	mentionable: boolean;

	@Column()
	name: string;

	@Column()
	rights: BigInt;

	@Column()
	position: number;

	@Column({ nullable: true })
	icon: BigInt;

	@Column({ nullable: true })
	unicode_emoji: BigInt;
}
