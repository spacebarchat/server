import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { User } from "./User";

@Entity("rate_limits")
export class RateLimit extends BaseClass {
	@Column()
	id: "global" | "error" | string; // channel_239842397 | guild_238927349823 | webhook_238923423498

	@Column() // no relation as it also
	executor_id: string;

	@Column()
	hits: number;

	@Column()
	blocked: boolean;

	@Column()
	expires_at: Date;
}
