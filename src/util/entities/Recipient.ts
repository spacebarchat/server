import "reflect-metadata";
import { Column, Entity, JoinColumn, ManyToOne, Relation, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Channel } from "./Channel";
import { User } from "./User";

@Entity("recipients")
export class Recipient extends BaseClass {
	@Column()
	@RelationId((recipient: Recipient) => recipient.channel)
	channel_id: string;

	@JoinColumn({ name: "channel_id" })
	@ManyToOne(() => Channel, {
		onDelete: "CASCADE"
	})
	channel: Relation<Channel>;

	@Column()
	@RelationId((recipient: Recipient) => recipient.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE"
	})
	user: Relation<User>;

	@Column({ default: false })
	closed: boolean;

	// TODO: settings/mute/nick/added at/encryption keys/read_state
}
