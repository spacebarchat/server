import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
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

	@Column()
	managed: boolean;

	@Column()
	name: string;

	@Column()
	require_colons: boolean;
}
