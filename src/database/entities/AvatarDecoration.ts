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
import { Member } from "./Member";

@Entity({
    name: "avatar_decorations",
})
export class AvatarDecoration extends BaseClass {
    @Column({})
    asset: string;

    @Column({ default: false })
    approved: boolean;

    @Column({ nullable: true })
    @RelationId((deco: AvatarDecoration) => deco.uploader)
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

    async canUseAvatarDecoration(user_id: string): Promise<boolean> {
        if (!this.approved) return false;
        if (this.uploader_id == user_id) return true;
        if (this.allowed_user_ids.includes(user_id)) return true;

        let memberships: Member[];
        if (this.allowed_guild_ids.length > 0) {
            memberships ??= await Member.find({ select: { guild_id: true, roles: { id: true } }, where: { id: user_id }, relations: { roles: true } });
            const guildIds = memberships.map((x) => x.guild_id);
            for (const allowedGuildId of this.allowed_guild_ids) if (guildIds.includes(allowedGuildId)) return true;
        }

        if (this.allowed_role_ids.length > 0) {
            memberships ??= await Member.find({ select: { guild_id: true, roles: true }, where: { id: user_id } });
            const roleIds = memberships.flatMap((x) => x.roles.map((x) => x.id));
            for (const allowedRoleId of this.allowed_role_ids) if (roleIds.includes(allowedRoleId)) return true;
        }

        return false;
    }
}
