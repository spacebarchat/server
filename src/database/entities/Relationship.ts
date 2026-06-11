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

import { Column, Entity, Index, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { User } from "./User";
import { RelationshipType } from "@spacebar/schemas";

@Entity({
    name: "relationships",
})
@Index(["from_id", "to_id"], { unique: true })
export class Relationship extends BaseClass {
    @Column({})
    @RelationId((relationship: Relationship) => relationship.from)
    from_id: string;

    @JoinColumn({ name: "from_id" })
    @ManyToOne(() => User, {
        onDelete: "CASCADE",
    })
    from: User;

    @Column({})
    @RelationId((relationship: Relationship) => relationship.to)
    to_id: string;

    @JoinColumn({ name: "to_id" })
    @ManyToOne(() => User, {
        onDelete: "CASCADE",
    })
    to: User;

    @Column({ nullable: true })
    nickname?: string;

    @Column({ type: "int" })
    type: RelationshipType;

    toPublicRelationship() {
        return {
            id: this.to?.id || this.to_id,
            type: this.type,
            nickname: this.nickname,
            user: this.to?.toPublicUser(),
        };
    }
}
