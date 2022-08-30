import { Column, Entity } from "typeorm";
import { BaseClass } from "./BaseClass";

@Entity("rate_limits")
export class RateLimit extends BaseClass {
	@Column() // no relation as it also
	executor_id: string;

	@Column()
	hits: number;

	@Column()
	blocked: boolean;

	@Column()
	expires_at: Date;
}
