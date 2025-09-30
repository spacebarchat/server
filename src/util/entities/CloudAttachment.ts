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
import { BaseClass } from "./BaseClass";
import { dbEngine } from "../util/Database";
import { User } from "./User";
import { Channel } from "./Channel";

@Entity({
	name: "cloud_attachments",
	engine: dbEngine,
})
export class CloudAttachment extends BaseClass {
	// Internal tracking metadata
	@Column({ name: "user_id", nullable: true })
	@RelationId((att: CloudAttachment) => att.user)
	userId: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
	user?: User;

	@Column({ name: "channel_id", nullable: true })
	@RelationId((att: CloudAttachment) => att.channel)
	channelId?: string; // channel the file is uploaded to

	@JoinColumn({ name: "channel_id" })
	@ManyToOne(() => Channel, { nullable: true, onDelete: "SET NULL" })
	channel?: Channel; // channel the file is uploaded to

	@Column({ name: "upload_filename" })
	uploadFilename: string;

	// User-provided info
	@Column({ name: "user_attachment_id", nullable: true })
	userAttachmentId?: string;

	@Column({ name: "user_filename" })
	userFilename: string; // name of file attached

	@Column({ name: "user_file_size", nullable: true })
	userFileSize?: number; // size of file in bytes

	@Column({ name: "user_original_content_type", nullable: true })
	userOriginalContentType?: string;

	@Column({ name: "user_is_clip", nullable: true })
	userIsClip?: boolean; // whether the file is a clip

	// Actual file info, initialised after upload
	@Column({ nullable: true })
	size?: number; // size of file in bytes

	@Column({ nullable: true })
	height?: number; // height of file (if image)

	@Column({ nullable: true })
	width?: number; // width of file (if image)

	@Column({ name: "content_type", nullable: true })
	contentType?: string;

	// @BeforeRemove()
	// onDelete() {
	// 	return deleteFile(new URL(this.url).pathname);
	// }
}
