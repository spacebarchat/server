import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { User } from "./User";
import { Channel } from "./Channel";

@Entity({
	name: "streams",
})
export class Stream extends BaseClass {
	@Column()
	@RelationId((stream: Stream) => stream.owner)
	owner_id: string;

	@JoinColumn({ name: "owner_id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	owner: User;

	@Column()
	@RelationId((stream: Stream) => stream.channel)
	channel_id: string;

	@JoinColumn({ name: "channel_id" })
	@ManyToOne(() => Channel, {
		onDelete: "CASCADE",
	})
	channel: Channel;

	@Column()
	endpoint: string;
}
