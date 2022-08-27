import "reflect-metadata";
import { Column, Entity, JoinColumn, ManyToOne, Relation, RelationId } from "typeorm";
import { User } from ".";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";

@Entity("emojis")
export class Emoji extends BaseClass {
	@Column()
	animated: boolean;

	@Column()
	available: boolean; // whether this emoji can be used, may be false due to various reasons

	@Column()
	guild_id: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, {
		onDelete: "CASCADE"
	})
	guild: Relation<Guild>;

	@Column({ nullable: true })
	@RelationId((emoji: Emoji) => emoji.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User)
	user: Relation<User>;

	@Column()
	managed: boolean;

	@Column()
	name: string;

	@Column()
	require_colons: boolean;

	@Column({ type: "simple-array" })
	roles: string[]; // roles this emoji is whitelisted to (new discord feature?)

	@Column({ type: "simple-array", nullable: true })
	groups: string[]; // user groups this emoji is whitelisted to (Fosscord extension)
}
