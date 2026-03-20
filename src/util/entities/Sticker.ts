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

import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { StickerFormatType, StickerType } from "@spacebar/schemas";
import { BaseClass } from "./BaseClass";
import type { Guild } from "./Guild";
import type { User } from "./User";
import type { StickerPack } from "./StickerPack";

@Entity({
    name: "stickers",
})
export class Sticker extends BaseClass {
    @Column()
    name: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    available?: boolean;

    @Column({ nullable: true })
    tags?: string;

    @Column({ nullable: true })
    @RelationId((sticker: Sticker) => sticker.pack)
    pack_id?: string;

    @JoinColumn({ name: "pack_id" })
    @ManyToOne(() => require("./StickerPack").StickerPack, {
        onDelete: "CASCADE",
        nullable: true,
    })
    pack: StickerPack;

    @Column({ nullable: true })
    guild_id?: string;

    @JoinColumn({ name: "guild_id" })
    @ManyToOne(() => require("./Guild").Guild, (guild: Guild) => guild.stickers, {
        onDelete: "CASCADE",
    })
    guild?: Guild;

    @Column({ nullable: true })
    user_id?: string;

    @JoinColumn({ name: "user_id" })
    @ManyToOne(() => require("./User").User, {
        onDelete: "CASCADE",
    })
    user?: User;

    @Column({ type: "int" })
    type: StickerType;

    @Column({ type: "int" })
    format_type: StickerFormatType;
}
