import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Relation, RelationId } from "typeorm";
import { Sticker } from ".";
import { BaseClass } from "./BaseClass";

@Entity("sticker_packs")
export class StickerPack extends BaseClass {
	@Column()
	name: string;

	@Column({ nullable: true })
	description?: string;

	@Column({ nullable: true })
	banner_asset_id?: string;

	@OneToMany(() => Sticker, (sticker: Sticker) => sticker.pack, {
		cascade: true,
		orphanedRowAction: "delete"
	})
	stickers: Relation<Sticker[]>;

	// sku_id: string

	@Column({ nullable: true })
	@RelationId((pack: StickerPack) => pack.cover_sticker)
	cover_sticker_id?: string;

	@ManyToOne(() => Sticker, { nullable: true })
	@JoinColumn()
	cover_sticker?: Relation<Sticker>;
}
