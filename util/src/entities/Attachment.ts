import { BeforeRemove, Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { URL } from "url";
import { deleteFile } from "../util/cdn";
import { BaseClass } from "./BaseClass";

@Entity("attachments")
export class Attachment extends BaseClass {
	@Column()
	filename: string; // name of file attached

	@Column()
	size: number; // size of file in bytes

	@Column()
	url: string; // source url of file

	@Column()
	proxy_url: string; // a proxied url of file

	@Column({ nullable: true })
	height?: number; // height of file (if image)

	@Column({ nullable: true })
	width?: number; // width of file (if image)

	@Column({ nullable: true })
	content_type?: string;

	@Column({ nullable: true })
	@RelationId((attachment: Attachment) => attachment.message)
	message_id: string;

	@JoinColumn({ name: "message_id" })
	@ManyToOne(() => require("./Message").Message, (message: import("./Message").Message) => message.attachments, {
		onDelete: "CASCADE",
	})
	message: import("./Message").Message;

	@BeforeRemove()
	onDelete() {
		return deleteFile(new URL(this.url).pathname);
	}
}
