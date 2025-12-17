/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Column, Entity, JoinColumn, ManyToOne, OneToMany, RelationId } from "typeorm";
import { Sticker } from ".";
import { BaseClass } from "./BaseClass";

@Entity({
	name: "sticker_packs",
})
export class StickerPack extends BaseClass {
	@Column()
	name: string;

	@Column({ nullable: true })
	description?: string;

	@Column({ nullable: true })
	banner_asset_id?: string;

	@OneToMany(() => Sticker, (sticker: Sticker) => sticker.pack, {
		cascade: true,
		orphanedRowAction: "delete",
	})
	stickers: Sticker[];

	// sku_id: string

	@Column({ nullable: true })
	@RelationId((pack: StickerPack) => pack.cover_sticker)
	cover_sticker_id?: string;

	@ManyToOne(() => Sticker, { nullable: true })
	@JoinColumn()
	cover_sticker?: Sticker;
}
