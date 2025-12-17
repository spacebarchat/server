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
import { Channel } from "./Channel";
import { User } from "./User";

// for read receipts
// notification cursor and public read receipt need to be forwards-only (the former to prevent re-pinging when marked as unread, and the latter to be acceptable as a legal acknowledgement in criminal proceedings), and private read marker needs to be advance-rewind capable
// public read receipt ≥ notification cursor ≥ private fully read marker

@Entity({
    name: "read_states",
})
@Index(["channel_id", "user_id"], { unique: true })
export class ReadState extends BaseClass {
    @Column()
    @RelationId((read_state: ReadState) => read_state.channel)
    channel_id: string;

    @JoinColumn({ name: "channel_id" })
    @ManyToOne(() => Channel, {
        onDelete: "CASCADE",
    })
    channel: Channel;

    @Column()
    @RelationId((read_state: ReadState) => read_state.user)
    user_id: string;

    @JoinColumn({ name: "user_id" })
    @ManyToOne(() => User, {
        onDelete: "CASCADE",
    })
    user: User;

    // fully read marker
    @Column({ nullable: true })
    last_message_id: string;

    // public read receipt
    @Column({ nullable: true })
    public_ack: string;

    // notification cursor / private read receipt
    @Column({ nullable: true })
    notifications_cursor: string;

    @Column({ nullable: true })
    last_pin_timestamp?: Date;

    @Column({ nullable: true })
    mention_count: number;

    // @Column({ nullable: true })
    // TODO: derive this from (last_message_id=notifications_cursor=public_ack)=true
    manual: boolean;
}
