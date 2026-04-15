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

import { BeforeRemove, Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { Config, deleteFile } from "../util";
import { BaseClass } from "./BaseClass";
import { getUrlSignature, NewUrlUserSignatureData, NewUrlSignatureData } from "../Signing";
import { PublicAttachment } from "../../schemas/api/messages/Attachments";

@Entity({
    name: "attachments",
})
export class Attachment extends BaseClass {
    @Column()
    filename: string; // name of file attached

    @Column()
    size: number; // size of file in bytes

    @Column({ nullable: true })
    height?: number; // height of file (if image)

    @Column({ nullable: true })
    width?: number; // width of file (if image)

    @Column({ nullable: true })
    content_type?: string;

    @Column({ nullable: true })
    @RelationId((attachment: Attachment) => attachment.message)
    message_id: string;

    @Column({ nullable: true })
    @RelationId((attachment: Attachment) => attachment.channel)
    channel_id: string;

    @JoinColumn({ name: "message_id" })
    @ManyToOne(() => require("./Message").Message, (message: import("./Message").Message) => message.attachments, {
        onDelete: "CASCADE",
    })
    message: import("./Message").Message;

    @JoinColumn({ name: "channel_id" })
    @ManyToOne(() => require("./Channel").Channel, {
        onDelete: "CASCADE",
    })
    channel: import("./Channel").Channel;

    @BeforeRemove()
    onDelete() {
        return deleteFile(new URL(this.toJSON().url).pathname);
    }

    toJSON() {
        const channelId = this.channel_id ?? this.channel?.id ?? this.message?.channel_id;
        const messageId = this.message_id ?? this.message?.id;
        return {
            ...this,
            url: `${Config.get().cdn.endpointPublic}/attachments/${channelId}/${messageId}/${this.filename}`,
            proxy_url: `${Config.get().cdn.endpointPublic}/attachments/${channelId}/${messageId}/${this.filename}`,
        };
    }
    signUrls(data: NewUrlUserSignatureData): PublicAttachment {
        const att = Attachment.prototype.toJSON.apply(this);
        return {
            ...att,
            url: getUrlSignature(new NewUrlSignatureData({ ...data, url: att.url }))
                .applyToUrl(att.url)
                .toString(),
            proxy_url: att.proxy_url
                ? getUrlSignature(new NewUrlSignatureData({ ...data, url: att.proxy_url }))
                      .applyToUrl(att.proxy_url)
                      .toString()
                : att.proxy_url,
        };
    }
}
