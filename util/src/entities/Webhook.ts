import { Column, Entity, JoinColumn } from "typeorm";
import { BaseClass } from "./BaseClass";

export enum WebhookType {
	Incoming = 1,
	ChannelFollower = 2,
}

@Entity("webhooks")
export class Webhook extends BaseClass {
	@Column()
	id: string;

	@Column({ type: "simple-enum", enum: WebhookType })
	type: WebhookType;

	@Column()
	name?: string;

	@Column()
	avatar?: string;

	@Column()
	token?: string;

	@JoinColumn()
	guild?: string;

	@JoinColumn()
	channel: string;

	@JoinColumn()
	application?: string;

	@JoinColumn()
	user?: string;

	@JoinColumn()
	source_guild: string;
}
