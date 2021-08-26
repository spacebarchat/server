import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";
import { Role } from "./Role";

@Entity("emojis")
export class Emoji extends BaseClass {
	@Column()
	animated: boolean;

	@Column()
	available: boolean;

	@Column()
	guild_id: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, (guild: Guild) => guild.id)
	guild: Guild;

	@Column()
	managed: boolean;

	@Column()
	name: string;

	@Column()
	require_colons: boolean;

	@Column()
	url: string;

	@RelationId((emoji: Emoji) => emoji.roles)
	role_ids: string[];

	@JoinColumn({ name: "role_ids" })
	@ManyToMany(() => Role, (role: Role) => role.id)
	roles: Role[]; // roles this emoji is whitelisted to (new discord feature?)
}
