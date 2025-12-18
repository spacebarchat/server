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

import { User } from "./User";
import { Member } from "./Member";
import { Role } from "./Role";
import { Channel } from "./Channel";
import { InteractionType } from "../interfaces/Interaction";
import { Application } from "./Application";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, RelationId, FindOneOptions, Raw, Not, BaseEntity } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";
import { Webhook } from "./Webhook";
import { Sticker } from "./Sticker";
import { Attachment } from "./Attachment";
import { NewUrlUserSignatureData } from "../Signing";
import { ActionRowComponent, ApplicationCommandType, Embed, MessageSnapshot, MessageType, PartialMessage, Poll, Reaction } from "@spacebar/schemas";
import { MessageFlags } from "@spacebar/util";

@Entity({
    name: "messages",
})
@Index(["channel_id", "id"], { unique: true })
export class Message extends BaseClass {
    @Column({ nullable: true })
    @RelationId((message: Message) => message.channel)
    @Index()
    channel_id?: string;

    @JoinColumn({ name: "channel_id" })
    @ManyToOne(() => Channel, {
        onDelete: "CASCADE",
    })
    channel: Channel;

    @Column({ nullable: true })
    @RelationId((message: Message) => message.guild)
    guild_id?: string;

    @JoinColumn({ name: "guild_id" })
    @ManyToOne(() => Guild, {
        onDelete: "CASCADE",
    })
    guild?: Guild;

    @Column({ nullable: true })
    @RelationId((message: Message) => message.author)
    @Index()
    author_id?: string;

    @JoinColumn({ name: "author_id", referencedColumnName: "id" })
    @ManyToOne(() => User, {
        onDelete: "CASCADE",
    })
    author?: User;

    @Column({ nullable: true })
    @RelationId((message: Message) => message.member)
    member_id?: string;

    @JoinColumn({ name: "member_id", referencedColumnName: "id" })
    @ManyToOne(() => User, {
        onDelete: "CASCADE",
    })
    member?: Member;

    @Column({ nullable: true })
    @RelationId((message: Message) => message.webhook)
    webhook_id?: string;

    @JoinColumn({ name: "webhook_id" })
    @ManyToOne(() => Webhook)
    webhook?: Webhook;

    @Column({ nullable: true })
    @RelationId((message: Message) => message.application)
    application_id?: string;

    @JoinColumn({ name: "application_id" })
    @ManyToOne(() => Application)
    application?: Application;

    @Column({ nullable: true })
    content?: string;

    @Column()
    @CreateDateColumn()
    timestamp: Date;

    @Column({ nullable: true })
    edited_timestamp?: Date;

    @Column({ nullable: true })
    tts?: boolean;

    @Column({ nullable: true })
    mention_everyone?: boolean;

    @JoinTable({ name: "message_user_mentions" })
    @ManyToMany(() => User)
    mentions: User[];

    @JoinTable({ name: "message_role_mentions" })
    @ManyToMany(() => Role)
    mention_roles: Role[];

    @JoinTable({ name: "message_channel_mentions" })
    @ManyToMany(() => Channel)
    mention_channels: Channel[];

    @JoinTable({ name: "message_stickers" })
    @ManyToMany(() => Sticker, { cascade: true, onDelete: "CASCADE" })
    sticker_items?: Sticker[];

    @OneToMany(() => Attachment, (attachment: Attachment) => attachment.message, {
        cascade: true,
        orphanedRowAction: "delete",
    })
    attachments?: Attachment[];

    @Column({ type: "simple-json" })
    embeds: Embed[];

    @Column({ type: "simple-json" })
    reactions: Reaction[];

    @Column({ type: "text", nullable: true })
    nonce?: string;

    @Column({ nullable: true, type: Date })
    pinned_at?: Date | null;

    get pinned(): boolean {
        return this.pinned_at != null;
    }

    @Column({ type: "int" })
    type: MessageType;

    @Column({ type: "simple-json", nullable: true })
    activity?: {
        type: number;
        party_id: string;
    };

    @Column({ default: 0 })
    flags: number;

    @Column({ type: "simple-json", nullable: true })
    message_reference?: {
        message_id: string;
        channel_id?: string;
        guild_id?: string;
        type?: number; // 0 = DEFAULT, 1 = FORWARD
    };

    @JoinColumn({ name: "message_reference_id" })
    @ManyToOne(() => Message, { onDelete: "SET NULL" })
    referenced_message?: Message | null;

    @Column({ type: "simple-json", nullable: true })
    interaction?: {
        id: string;
        type: InteractionType;
        name: string;
    };

    @Column({ type: "simple-json", nullable: true })
    interaction_metadata?: {
        id: string;
        type: InteractionType;
        user_id: string;
        authorizing_integration_owners: object;
        name: string;
        command_type: ApplicationCommandType;
    };

    @Column({ type: "simple-json", nullable: true })
    components?: ActionRowComponent[];

    @Column({ type: "simple-json", nullable: true })
    poll?: Poll;

    @Column({ nullable: true })
    username?: string;

    @Column({ nullable: true })
    avatar?: string;

	@Column({ default: "[]", type: "simple-json" })
	message_snapshots: MessageSnapshot[];

    toJSON(): Message {
        return {
            ...this,
            author_id: undefined,
            member_id: undefined,
            webhook_id: this.webhook_id ?? undefined,
            application_id: undefined,

            nonce: this.nonce ?? undefined,
            tts: this.tts ?? false,
            guild: this.guild ?? undefined,
            webhook: this.webhook ?? undefined,
            interaction: this.interaction ?? undefined,
            interaction_metadata: this.interaction_metadata ?? undefined,
            reactions: this.reactions ?? undefined,
            sticker_items: this.sticker_items ?? undefined,
            message_reference: this.message_reference ?? undefined,
            author: {
                ...(this.author?.toPublicUser() ?? undefined),
                // Webhooks
                username: this.username ?? this.author?.username,
                avatar: this.avatar ?? this.author?.avatar,
            },
            activity: this.activity ?? undefined,
            application: this.application ?? undefined,
            components: this.components ?? undefined,
            poll: this.poll ?? undefined,
            content: this.content ?? "",
            pinned: this.pinned,
        };
    }

    toPartialMessage(): PartialMessage {
        return {
            id: this.id,
            // lobby_id: this.lobby_id,
            channel_id: this.channel_id!,
            type: this.type,
            content: this.content!,
            author: { ...this.author!, avatar: this.author?.avatar ?? null },
            flags: this.flags,
            application_id: this.application_id,
            //channel: this.channel, // TODO: ephemeral DM channels
            // recipient_id: this.recipient_id, // TODO: ephemeral DM channels
        };
    }

    withSignedAttachments(data: NewUrlUserSignatureData) {
        return {
            ...this,
            attachments: this.attachments?.map((attachment: Attachment) => Attachment.prototype.signUrls.call(attachment, data)),
        };
    }

    static async createWithDefaults(opts: Partial<Message>): Promise<Message> {
        const message = Message.create();

        if (!opts.author) {
            if (!opts.author_id) throw new Error("Either author or author_id must be provided to create a Message");
            opts.author = await User.findOneOrFail({ where: { id: opts.author_id! } });
        }

        if (!opts.channel) {
            if (!opts.channel_id) throw new Error("Either channel or channel_id must be provided to create a Message");
            opts.channel = await Channel.findOneOrFail({ where: { id: opts.channel_id! } });
            opts.guild_id ??= opts.channel.guild_id;
        }

        if (!opts.member_id) opts.member_id = message.author_id;
        if (!opts.member) opts.member = await Member.findOneOrFail({ where: { id: opts.member_id! } });

        if (!opts.guild) {
            if (opts.guild_id) opts.guild = await Guild.findOneOrFail({ where: { id: opts.guild_id! } });
            else if (opts.channel?.guild?.id) opts.guild = opts.channel.guild;
            else if (opts.channel?.guild_id) opts.guild = await Guild.findOneOrFail({ where: { id: opts.channel.guild_id! } });
            else if (opts.member?.guild?.id) opts.guild = opts.member.guild;
            else if (opts.member?.guild_id) opts.guild = await Guild.findOneOrFail({ where: { id: opts.member.guild_id! } });
            else throw new Error("Either guild, guild_id, channel.guild, channel.guild_id, member.guild or member.guild_id must be provided to create a Message");
        }

        // try 2 now that we have a guild
        if (!opts.member) opts.member = await Member.findOneOrFail({ where: { id: opts.author!.id, guild_id: opts.guild!.id } });

        // set reply type if a message if referenced
        if (opts.message_reference && !opts.type) message.type = MessageType.REPLY;

        // backpropagate ids
        opts.channel_id = opts.channel.id;
        opts.guild_id = opts.guild.id;
        opts.author_id = opts.author.id;
        opts.member_id = opts.member.id;
        opts.webhook_id = opts.webhook?.id;
        opts.application_id = opts.application?.id;

        delete opts.member;

        Object.assign(message, {
            tts: false,
            embeds: [],
            reactions: [],
            flags: 0,
            type: 0,
            timestamp: new Date(),
            ...opts,
        });
        return message;
    }
    static addDefault(options: FindOneOptions<Message>) {
        if (options.where) {
            const arr = options.where instanceof Array ? options.where : [options.where];
            for (const thing of arr) {
                if (!("flags" in thing)) {
                    thing.flags = Not(Raw((alias) => `${alias} & ${MessageFlags.FLAGS.EPHEMERAL} = ${MessageFlags.FLAGS.EPHEMERAL}`));
                }
            }
        }
    }
}

//@ts-expect-error It works but TS types hate it
Message.findOneOrFail = function (this: Message, options: FindOneOptions<Message>): Promise<Message> {
    Message.addDefault(options as FindOneOptions<Message>);
    //@ts-expect-error how to use generics on call, who knows!
    return BaseEntity.findOneOrFail.call(Message, options);
};
//@ts-expect-error It works but TS types hate it
Message.findOne = function (this: Message, options: FindOneOptions<Message>): Promise<Message> {
    Message.addDefault(options as FindOneOptions<Message>);
    //@ts-expect-error how to use generics on call, who knows!
    return BaseEntity.findOne.call(Message, options);
};
//@ts-expect-error It works but TS types hate it
Message.find = function (this: Message, options: FindOneOptions<Message>): Promise<Message[]> {
    Message.addDefault(options as FindOneOptions<Message>);
    //@ts-expect-error how to use generics on call, who knows!
    return BaseEntity.find.call(Message, options);
};
