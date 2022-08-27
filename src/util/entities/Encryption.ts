import "reflect-metadata";
import { Column, Entity } from "typeorm";
import { Snowflake } from "../util";
import { BitField } from "../util/BitField";
import { BaseClass } from "./BaseClass";

@Entity("security_settings")
export class SecuritySettings extends BaseClass {
	@Column({ nullable: true })
	guild_id: Snowflake;

	@Column({ nullable: true })
	channel_id: Snowflake;

	@Column()
	encryption_permission_mask: BitField;

	@Column()
	allowed_algorithms: string[];

	@Column()
	current_algorithm: string;

	@Column({ nullable: true })
	used_since_message: Snowflake;
}
