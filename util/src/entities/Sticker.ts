import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { User } from "./User";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";

export enum StickerType {
	STANDARD = 1,
	GUILD = 2,
}

export enum StickerFormatType {
	PNG = 1,
	APNG = 2,
	LOTTIE = 3,
}

@Entity("stickers")
export class Sticker extends BaseClass {
	@Column()
	name: string;

	@Column({ nullable: true })
	description?: string;

	@Column()
	tags: string;

	@Column()
	@RelationId((sticker: Sticker) => sticker.pack)
	pack_id: string;

	@JoinColumn({ name: "pack_id" })
	@ManyToOne(() => require("./StickerPack").StickerPack, {
		onDelete: "CASCADE",
	})
	pack: import("./StickerPack").StickerPack;

	@Column({ nullable: true })
	guild_id?: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, {
		onDelete: "CASCADE",
	})
	guild?: Guild;

	@Column({ nullable: true })
	user_id?: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	user?: User;

	@Column({ type: "int" })
	type: StickerType;

	@Column({ type: "int" })
	format_type: StickerFormatType;
}
