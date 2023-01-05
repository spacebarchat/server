import { BaseClass } from "./BaseClass";
import { Entity, Column } from "typeorm";
import { Embed } from "./Message";

@Entity("embed_cache")
export class EmbedCache extends BaseClass {
	@Column()
	url: string;

	@Column({ type: "simple-json" })
	embed: Embed;
}
