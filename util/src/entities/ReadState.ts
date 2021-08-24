import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Channel } from "./Channel";
import { Message } from "./Message";
import { User } from "./User";

@Entity("read_states")
export class ReadState extends BaseClass {
	@Column()
	channel_id: string;

	@JoinColumn({ name: "channel_id" })
	@ManyToOne(() => Channel, (channel: Channel) => channel.id)
	channel: Channel;

	@Column()
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	user: User;

	@JoinColumn({ name: "last_message_id" })
	@ManyToOne(() => Message, (message: Message) => message.id)
	last_message?: Message;

	@Column()
	last_pin_timestamp?: Date;

	@Column()
	mention_count: number;

	@Column()
	manual: boolean;
}
