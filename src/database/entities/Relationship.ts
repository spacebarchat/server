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
import { PartialRelationshipSchema, RelationshipSchema, RelationshipType } from "@spacebar/schemas";

@Entity({
    name: "relationships",
})
@Index(["from_id", "to_id"], { unique: true })
export class Relationship extends BaseClass {
    @Column({})
    @RelationId((relationship: Relationship) => relationship.from)
    from_id: string;

    @JoinColumn({ name: "from_id", foreignKeyConstraintName: "FK_relationship_from_id" })
    @ManyToOne(() => User, {
        onDelete: "CASCADE",
    })
    from: User;

    @Column({})
    @RelationId((relationship: Relationship) => relationship.to)
    to_id: string;

    @JoinColumn({ name: "to_id", foreignKeyConstraintName: "FK_relationship_to_id" })
    @ManyToOne(() => User, {
        onDelete: "CASCADE",
    })
    to: User;

    @Column({ nullable: true })
    nickname?: string;

    @Column({ type: "int" })
    type: RelationshipType;

    @Column()
    user_ignored: boolean;

    @Column({ nullable: true })
    note?: string;

    @Column({ nullable: true })
    stranger_request?: boolean;

    @Column({ nullable: true })
    is_spam_request: boolean;

    @Column({ nullable: true, type: "timestamp with time zone" })
    since?: Date;

    toPublicRelationship() {
        return {
            id: this.to?.id || this.to_id,
            type: this.type,
            nickname: this.nickname ?? null,
            user: this.to?.toPartialUser(),
            user_ignored: this.user_ignored,
            note: this.note,
            stranger_request: this.stranger_request,
            is_spam_request: this.is_spam_request,
            origin_application_id: undefined, // we dont support this oauth behavior yet
            since: this.since,
        } satisfies RelationshipSchema;
    }

    toPartialRelationship(): PartialRelationshipSchema {
        return {
            id: this.to?.id ?? this.to_id,
            nickname: this.nickname ?? null,
            type: this.type,
            user_ignored: this.user_ignored,
            since: this.since,
            stranger_request: this.stranger_request,
        } satisfies PartialRelationshipSchema;
    }
}
