/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

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

import { Column, Entity, Index, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { AvatarDecorationData, PublicAvatarDecorationResponse } from "@spacebar/schemas";
import { BaseClass } from "./BaseClass";
import { User } from "./User";

@Entity({
    name: "avatar_decorations",
})
export class AvatarDecorations extends BaseClass {
    @Column({})
    asset: string;

    @Column({ default: false })
    approved: boolean;

    @Column({ nullable: true })
    @RelationId((deco: AvatarDecorations) => deco.uploader)
    @Index("IDX_avatar_decoration_uploader_id")
    uploader_id: string;

    @JoinColumn({ name: "uploader_id", foreignKeyConstraintName: "FK_avatar_decoration_uploader_id" })
    @ManyToOne(() => User, { onDelete: "CASCADE" })
    uploader: User;

    // access controls
    @Column({ default: false })
    public: boolean; // anyone can use

    @Column({ array: true, type: "int8" })
    allowed_user_ids: string[];

    @Column({ array: true, type: "int8" })
    allowed_guild_ids: string[];

    @Column({ array: true, type: "int8" })
    allowed_role_ids: string[];

    toJSON(): AvatarDecorationData {
        return {
            asset: this.asset,
            sku_id: this.id,
            expires_at: null,
        } satisfies AvatarDecorationData;
    }

    toPublicAvatarDecoration(opts?: { available: boolean }): PublicAvatarDecorationResponse {
        return {
            id: this.id,
            approved: this.approved,
            uploader: this.uploader.toPartialUser(),
            public: this.public,
            available: opts?.available ?? this.public,
        } satisfies PublicAvatarDecorationResponse;
    }
}
