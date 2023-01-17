import { Column, Entity } from "typeorm";
import { BaseClass } from "./BaseClass";

@Entity("security_settings")
export class SecuritySettings extends BaseClass {
	@Column({ nullable: true })
	guild_id: string;

	@Column({ nullable: true })
	channel_id: string;

	@Column()
	encryption_permission_mask: number;

	@Column({ type: "simple-array" })
	allowed_algorithms: string[];

	@Column()
	current_algorithm: string;

	@Column({ nullable: true })
	used_since_message: string;
}
