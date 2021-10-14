import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { User } from ".";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";
import { Role } from "./Role";

@Entity("emojis")
export class Emoji extends BaseClass {
	@Column()
	animated: boolean;

	@Column()
	available: boolean; // whether this emoji can be used, may be false due to loss of Server Boosts

	@Column()
	guild_id: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, {
		onDelete: "CASCADE",
	})
	guild: Guild;

	@Column({ nullable: true })
	@RelationId((emoji: Emoji) => emoji.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User)
	user: User;

	@Column()
	managed: boolean;

	@Column()
	name: string;

	@Column()
	require_colons: boolean;

	@Column({ type: "simple-array" })
	roles: string[]; // roles this emoji is whitelisted to (new discord feature?)
}
