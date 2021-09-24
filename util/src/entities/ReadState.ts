import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Channel } from "./Channel";
import { Message } from "./Message";
import { User } from "./User";

// for read receipts
// notification cursor and public read receipt need to be forwards-only (the former to prevent re-pinging when marked as unread, and the latter to be acceptable as a legal acknowledgement in criminal proceedings), and private read marker needs to be advance-rewind capable
// public read receipt ≥ notification cursor ≥ private fully read marker

@Entity("read_states")
export class ReadState extends BaseClass {
	@Column({ nullable: true })
	@RelationId((read_state: ReadState) => read_state.channel)
	channel_id: string;

	@JoinColumn({ name: "channel_id" })
	@ManyToOne(() => Channel, {
		onDelete: "CASCADE",
	})
	channel: Channel;

	@Column({ nullable: true })
	@RelationId((read_state: ReadState) => read_state.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	user: User;

	@Column({ nullable: true })
	@RelationId((read_state: ReadState) => read_state.last_message)
	last_message_id: string;

	@JoinColumn({ name: "last_message_id" })
	@ManyToOne(() => Message)
	last_message?: Message;

	@Column({ nullable: true })
	last_pin_timestamp?: Date;

	@Column()
	mention_count: number;

	@Column()
	manual: boolean;
}
