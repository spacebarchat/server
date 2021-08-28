import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
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
	pack_id: string;

	@Column({ nullable: true })
	guild_id?: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, (guild: Guild) => guild.id)
	guild?: Guild;

	@Column({ type: "simple-enum", enum: StickerType })
	type: StickerType;

	@Column({ type: "simple-enum", enum: StickerFormatType })
	format_type: StickerFormatType;
}
