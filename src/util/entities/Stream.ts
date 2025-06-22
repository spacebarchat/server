import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	RelationId,
} from "typeorm";
import { BaseClass } from "./BaseClass";
import { dbEngine } from "../util/Database";
import { User } from "./User";
import { Channel } from "./Channel";
import { StreamSession } from "./StreamSession";

@Entity({
	name: "streams",
	engine: dbEngine,
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
