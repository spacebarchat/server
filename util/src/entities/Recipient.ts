import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";

@Entity("recipients")
export class Recipient extends BaseClass {
	@Column()
	@RelationId((recipient: Recipient) => recipient.channel)
	channel_id: string;

	@JoinColumn({ name: "channel_id" })
	@ManyToOne(() => require("./Channel").Channel)
	channel: import("./Channel").Channel;

	@Column()
	@RelationId((recipient: Recipient) => recipient.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => require("./User").User)
	user: import("./User").User;

	// TODO: settings/mute/nick/added at/encryption keys/read_state
}
