import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseClass } from "./BaseClass";
import { User } from "./User";

@Entity("rate_limits")
export class RateLimit extends BaseClass {
	@Column()
	id: "global" | "error" | string; // channel_239842397 | guild_238927349823 | webhook_238923423498

	@Column()
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, (user) => user.id)
	user: User;

	@Column()
	hits: number;

	@Column()
	blocked: boolean;

	@Column()
	expires_at: Date;
}
