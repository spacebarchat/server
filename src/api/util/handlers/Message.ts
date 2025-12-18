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

import { EmbedHandlers } from "@spacebar/api";
import {
    Application,
    Attachment,
    Channel,
    Config,
    EmbedCache,
    emitEvent,
    EVERYONE_MENTION,
    getPermission,
    getRights,
    Guild,
    HERE_MENTION,
    Message,
    MessageCreateEvent,
    MessageUpdateEvent,
    Role,
    ROLE_MENTION,
    Sticker,
    User,
    //CHANNEL_MENTION,
    USER_MENTION,
    Webhook,
    handleFile,
    Permissions,
    normalizeUrl,
    DiscordApiErrors,
    CloudAttachment,
    ReadState,
    Member,
    Session,
    MessageFlags,
} from "@spacebar/util";
import { HTTPError } from "lambert-server";
import { In, Or, Equal, IsNull } from "typeorm";
import { ChannelType, Embed, EmbedType, MessageCreateAttachment, MessageCreateCloudAttachment, MessageCreateSchema, MessageType, Reaction } from "@spacebar/schemas";
const allow_empty = false;
// TODO: check webhook, application, system author, stickers
// TODO: embed gifs/videos/images

const LINK_REGEX = /<?https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)>?/g;

export async function handleMessage(opts: MessageOptions): Promise<Message> {
    const channel = await Channel.findOneOrFail({
        where: { id: opts.channel_id },
        relations: ["recipients"],
    });
    if (!channel || !opts.channel_id) throw new HTTPError("Channel not found", 404);

    let permission: undefined | Permissions;
    const limit = channel.rate_limit_per_user;

    if (limit) {
        const lastMsgTime = (await Message.findOne({ where: { channel_id: channel.id, author_id: opts.author_id }, select: { timestamp: true }, order: { timestamp: "DESC" } }))
            ?.timestamp;
        if (lastMsgTime && Date.now() - limit * 1000 < +lastMsgTime) {
            permission ||= await getPermission(opts.author_id, channel.guild_id, channel);
            //FIXME MANAGE_MESSAGES and MANAGE_CHANNELS will need to be removed once they're gone as checks
            if (!permission.has("MANAGE_MESSAGES") && !permission.has("MANAGE_CHANNELS") && !permission.has("BYPASS_SLOWMODE")) {
                throw DiscordApiErrors.SLOWMODE_RATE_LIMIT;
            }
        }
    }

    const stickers = opts.sticker_ids ? await Sticker.find({ where: { id: In(opts.sticker_ids) } }) : undefined;
    // cloud attachments with indexes
    const cloudAttachments = opts.attachments?.reduce(
        (acc, att, index) => {
            if ("uploaded_filename" in att) {
                acc.push({ attachment: att, index });
            }
            return acc;
        },
        [] as { attachment: MessageCreateCloudAttachment; index: number }[],
    );

    const message = Message.create({
        ...opts,
        poll: opts.poll,
        sticker_items: stickers,
        guild_id: channel.guild_id,
        channel_id: opts.channel_id,
        attachments: opts.attachments || [],
        embeds: opts.embeds || [],
        reactions: opts.reactions || [],
        type: opts.type ?? 0,
        mentions: [],
        components: opts.components ?? undefined, // Fix Discord-Go?
    });
    const ephermal = (message.flags & (1 << 6)) !== 0;

    if (cloudAttachments && cloudAttachments.length > 0) {
        console.log("[Message] Processing attachments for message", message.id, ":", message.attachments);
        const uploadedAttachments = await Promise.all(
            cloudAttachments.map(async (att) => {
                const cAtt = att.attachment;
                const attEnt = await CloudAttachment.findOneOrFail({
                    where: {
                        uploadFilename: cAtt.uploaded_filename,
                    },
                });

                const cloneResponse = await fetch(`${Config.get().cdn.endpointPrivate}/attachments/${attEnt.uploadFilename}/clone_to_message/${message.id}`, {
                    method: "POST",
                    headers: {
                        signature: Config.get().security.requestSignature || "",
                    },
                });

                if (!cloneResponse.ok) {
                    console.error(`[Message] Failed to clone attachment ${attEnt.userFilename} to message ${message.id}`);
                    throw new HTTPError("Failed to process attachment: " + (await cloneResponse.text()), 500);
                }

                const cloneRespBody = (await cloneResponse.json()) as { success: boolean; new_path: string };

                const realAtt = Attachment.create({
                    filename: attEnt.userFilename,
                    url: `${Config.get().cdn.endpointPublic}/${cloneRespBody.new_path}`,
                    proxy_url: `${Config.get().cdn.endpointPublic}/${cloneRespBody.new_path}`,
                    size: attEnt.size,
                    height: attEnt.height,
                    width: attEnt.width,
                    content_type: attEnt.contentType || attEnt.userOriginalContentType,
                });
                await realAtt.save();
                return { attachment: realAtt, index: att.index };
            }),
        );
        console.log("[Message] Processed attachments for message", message.id, ":", message.attachments);

        for (const att of uploadedAttachments) {
            message.attachments![att.index] = att.attachment;
        }
    }
    // else console.log("[Message] No cloud attachments to process for message", message.id, ":", message.attachments);

    if (message.content && message.content.length > Config.get().limits.message.maxCharacters) {
        throw new HTTPError("Content length over max character limit");
    }

    if (opts.author_id) {
        message.author = await User.findOneOrFail({
            where: { id: opts.author_id },
        });
        const rights = await getRights(opts.author_id);
        rights.hasThrow("SEND_MESSAGES");
    }
    if (opts.application_id) {
        message.application = await Application.findOneOrFail({
            where: { id: opts.application_id },
        });
    }

    if (opts.webhook_id) {
        message.webhook = await Webhook.findOneOrFail({
            where: { id: opts.webhook_id },
        });

        message.author =
            (await User.findOne({
                where: { id: opts.webhook_id },
            })) || undefined;

        if (!message.author) {
            message.author = User.create({
                id: opts.webhook_id,
                username: message.webhook.name,
                discriminator: "0000",
                avatar: message.webhook.avatar,
                public_flags: 0,
                premium: false,
                premium_type: 0,
                bot: true,
                created_at: new Date(),
                verified: true,
                rights: "0",
                data: {
                    valid_tokens_since: new Date(),
                },
            });

            await message.author.save();
        }

        if (opts.username) {
            message.username = opts.username;
            message.author.username = message.username;
        }
        if (opts.avatar_url) {
            const avatarData = await fetch(opts.avatar_url);
            const base64 = await avatarData.arrayBuffer().then((x) => Buffer.from(x).toString("base64"));

            const dataUri = "data:" + avatarData.headers.get("content-type") + ";base64," + base64;

            message.avatar = await handleFile(`/avatars/${opts.webhook_id}`, dataUri as string);
            message.author.avatar = message.avatar;
        }
    } else {
        permission ||= await getPermission(opts.author_id, channel.guild_id, channel);
        permission.hasThrow("SEND_MESSAGES");
        if (permission.cache.member) {
            message.member = permission.cache.member;
        }

        if (opts.tts) permission.hasThrow("SEND_TTS_MESSAGES");
        if (opts.message_reference) {
            permission.hasThrow("READ_MESSAGE_HISTORY");
            // code below has to be redone when we add custom message routing
            if (message.guild_id !== null) {
                const guild = await Guild.findOneOrFail({
                    where: { id: channel.guild_id },
                });
                if (!opts.message_reference.guild_id) opts.message_reference.guild_id = channel.guild_id;
                if (!opts.message_reference.channel_id) opts.message_reference.channel_id = opts.channel_id;

                if (opts.message_reference.type != 1) {
                    if (opts.message_reference.guild_id !== channel.guild_id) throw new HTTPError("You can only reference messages from this guild");
                    if (opts.message_reference.channel_id !== opts.channel_id) throw new HTTPError("You can only reference messages from this channel");
                }

                message.message_reference = opts.message_reference;
                message.referenced_message = await Message.findOneOrFail({
                    where: {
                        id: opts.message_reference.message_id,
                    },
                    relations: ["author", "webhook", "application", "mentions", "mention_roles", "mention_channels", "sticker_items", "attachments"],
                });

                if (message.referenced_message.channel_id && message.referenced_message.channel_id !== opts.message_reference.channel_id)
                    throw new HTTPError("Referenced message not found in the specified channel", 404);
                if (message.referenced_message.guild_id && message.referenced_message.guild_id !== opts.message_reference.guild_id)
                    throw new HTTPError("Referenced message not found in the specified channel", 404);
            }
            /** Q: should be checked if the referenced message exists? ANSWER: NO
			 otherwise backfilling won't work **/
            message.type = MessageType.REPLY;
        }
    }

    // TODO: stickers/activity
    if (
        !allow_empty &&
        !opts.content &&
        !opts.embeds?.length &&
        !opts.attachments?.length &&
        !opts.sticker_ids?.length &&
        !opts.poll &&
        !opts.components?.length &&
        opts.message_reference?.type != 1
    ) {
        console.log("[Message] Rejecting empty message:", opts, message);
        throw new HTTPError("Empty messages are not allowed", 50006);
    }

    let content = opts.content;

    // root@Rory - 20/02/2023 - This breaks channel mentions in test client. We're not sure this was used in older clients.
    //const mention_channel_ids = [] as string[];
    const mention_role_ids = [] as string[];
    const mention_user_ids = [] as string[];
    let mention_everyone = false;

    if (content) {
        // TODO: explicit-only mentions
        message.content = content.trim();
        content = content.replace(/ *`[^)]*` */g, ""); // remove codeblocks
        // root@Rory - 20/02/2023 - This breaks channel mentions in test client. We're not sure this was used in older clients.
        /*for (const [, mention] of content.matchAll(CHANNEL_MENTION)) {
			if (!mention_channel_ids.includes(mention))
				mention_channel_ids.push(mention);
		}*/

        for (const [, mention] of content.matchAll(USER_MENTION)) {
            if (!mention_user_ids.includes(mention)) mention_user_ids.push(mention);
        }

        await Promise.all(
            Array.from(content.matchAll(ROLE_MENTION)).map(async ([, mention]) => {
                const role = await Role.findOneOrFail({
                    where: { id: mention, guild_id: channel.guild_id },
                });
                if (role.mentionable || opts.webhook_id || permission?.has("MANAGE_ROLES")) {
                    mention_role_ids.push(mention);
                }
            }),
        );

        if (opts.webhook_id || permission?.has("MENTION_EVERYONE")) {
            mention_everyone = !!content.match(EVERYONE_MENTION) || !!content.match(HERE_MENTION);
        }
    }

    if (message.message_reference?.message_id) {
        const referencedMessage = await Message.findOne({
            where: {
                id: message.message_reference.message_id,
                channel_id: message.channel_id,
            },
        });
        if (referencedMessage && referencedMessage.author_id !== message.author_id) {
            message.mentions.push(
                User.create({
                    id: referencedMessage.author_id,
                }),
            );
        }

        // FORWARD
        if (message.message_reference.type === 1) {
            message.type = MessageType.DEFAULT;

            if (message.referenced_message) {
                const mention_roles: string[] = [];
                const mentions: string[] = [];

                message.message_snapshots = [
                    {
                        message: {
                            attachments: message.referenced_message.attachments,
                            components: message.referenced_message.components,
                            content: message.referenced_message.content!,
                            edited_timestamp: message.referenced_message.edited_timestamp,
                            embeds: message.referenced_message.embeds,
                            flags: message.referenced_message.flags,
                            mention_roles,
                            mentions,
                            timestamp: message.referenced_message.timestamp,
                            type: message.referenced_message.type,
                        },
                    },
                ];
            }
        }
    }

    // root@Rory - 20/02/2023 - This breaks channel mentions in test client. We're not sure this was used in older clients.
    /*message.mention_channels = mention_channel_ids.map((x) =>
		Channel.create({ id: x }),
	);*/
    message.mention_roles = (
        await Promise.all(
            mention_role_ids.map((x) => {
                return Role.findOne({ where: { id: x } });
            }),
        )
    ).filter((role) => role !== null);

    message.mentions = [
        ...message.mentions,
        ...(
            await Promise.all(
                mention_user_ids.map((x) => {
                    return User.findOne({ where: { id: x } });
                }),
            )
        ).filter((user) => user !== null),
    ];

    message.mention_everyone = mention_everyone;
    async function fillInMissingIDs(ids: string[]) {
        const states = await ReadState.findBy({
            user_id: Or(...ids.map((id) => Equal(id))),
            channel_id: channel.id,
        });
        const users = new Set(ids);
        states.forEach((state) => users.delete(state.user_id));
        if (!users.size) {
            return;
        }
        return Promise.all(
            [...users].map((user_id) => {
                return ReadState.create({ user_id, channel_id: channel.id }).save();
            }),
        );
    }
    if (ephermal) {
        const id = message.interaction_metadata?.user_id;
        if (id) {
            let pinged = mention_everyone || channel.type === ChannelType.DM || channel.type === ChannelType.GROUP_DM;
            if (!pinged) pinged = !!message.mentions.find((user) => user.id === id);
            if (!pinged) pinged = !!(await Member.find({ where: { id, roles: Or(...message.mention_roles.map(({ id }) => Equal(id))) } }));
            if (pinged) {
                //stuff
            }
        }
    } else if ((!!message.content?.match(EVERYONE_MENTION) && permission?.has("MENTION_EVERYONE")) || channel.type === ChannelType.DM || channel.type === ChannelType.GROUP_DM) {
        if (channel.type === ChannelType.DM || channel.type === ChannelType.GROUP_DM) {
            if (channel.recipients) {
                await fillInMissingIDs(channel.recipients.map(({ user_id }) => user_id));
            }
        } else {
            console.log(channel.guild_id);
            await fillInMissingIDs((await Member.find({ where: { guild_id: channel.guild_id } })).map(({ id }) => id));
        }
        const repository = ReadState.getRepository();
        const condition = { channel_id: channel.id };
        await repository.update({ ...condition, mention_count: IsNull() }, { mention_count: 0 });
        await repository.increment(condition, "mention_count", 1);
    } else {
        const users = new Set<string>([
            ...(message.mention_roles.length
                ? await Member.find({
                      where: [
                          ...message.mention_roles.map((role) => {
                              return { roles: { id: role.id } };
                          }),
                      ],
                  })
                : []
            ).map((member) => member.id),
            ...message.mentions.map((user) => user.id),
        ]);
        if (!!message.content?.match(HERE_MENTION) && permission?.has("MENTION_EVERYONE")) {
            const ids = (await Member.find({ where: { guild_id: channel.guild_id } })).map(({ id }) => id);
            (await Session.find({ where: { user_id: Or(...ids.map((id) => Equal(id))) } })).forEach(({ user_id }) => users.add(user_id));
        }
        if (users.size) {
            const repository = ReadState.getRepository();
            const condition = { user_id: Or(...[...users].map((id) => Equal(id))), channel_id: channel.id };

            await fillInMissingIDs([...users]);

            await repository.update({ ...condition, mention_count: IsNull() }, { mention_count: 0 });
            await repository.increment(condition, "mention_count", 1);
        }
    }

    // TODO: check and put it all in the body

    return message;
}

// TODO: cache link result in db
export async function postHandleMessage(message: Message) {
    const content = message.content?.replace(/ *`[^)]*` */g, ""); // remove markdown

    const linkMatches = content?.match(LINK_REGEX) || [];

    const data = { ...message };

    const currentNormalizedUrls = new Set<string>();
    for (const link of linkMatches) {
        // Don't process links in <>
        if (link.startsWith("<") && link.endsWith(">")) {
            continue;
        }
        try {
            const normalized = normalizeUrl(link);
            currentNormalizedUrls.add(normalized);
        } catch (e) {
            continue;
        }
    }

    data.embeds.forEach((embed) => {
        if (!embed.type) {
            embed.type = EmbedType.rich;
        }
    });
    // Filter out embeds that could be links, start from scratch
    data.embeds = data.embeds.filter((embed) => embed.type === "rich");

    const seenNormalizedUrls = new Set<string>();
    const uniqueLinks: string[] = [];

    for (const link of linkMatches.slice(0, 20)) {
        // embed max 20 links - TODO: make this configurable with instance policies
        // Don't embed links in <>
        if (link.startsWith("<") && link.endsWith(">")) continue;

        try {
            const normalized = normalizeUrl(link);

            if (!seenNormalizedUrls.has(normalized)) {
                seenNormalizedUrls.add(normalized);
                uniqueLinks.push(link);
            }
        } catch (e) {
            // Invalid URL, skip
            continue;
        }
    }

    if (uniqueLinks.length === 0) {
        // No valid unique links found, update message to remove old embeds
        data.embeds = data.embeds.filter((embed) => embed.type === "rich");
        const author = data.author?.toPublicUser();
        const event = {
            event: "MESSAGE_UPDATE",
            channel_id: message.channel_id,
            data: {
                ...data,
                author,
            },
        } as MessageUpdateEvent;
        await Promise.all([emitEvent(event), Message.update({ id: message.id, channel_id: message.channel_id }, { embeds: data.embeds })]);
        return;
    }

    const cachePromises = [];

    for (const link of uniqueLinks) {
        let url: URL;
        try {
            url = new URL(link);
        } catch (e) {
            // Skip invalid URLs
            continue;
        }

        const normalizedUrl = normalizeUrl(link);

        // Check cache using normalized URL
        const cached = await EmbedCache.findOne({
            where: { url: normalizedUrl },
        });

        if (cached) {
            data.embeds.push(cached.embed);
            continue;
        }

        // bit gross, but whatever!
        const endpointPublic = Config.get().cdn.endpointPublic; // lol
        const handler = url.hostname === new URL(endpointPublic!).hostname ? EmbedHandlers["self"] : EmbedHandlers[url.hostname] || EmbedHandlers["default"];

        try {
            let res = await handler(url);
            if (!res) continue;
            // tried to use shorthand but types didn't like me L
            if (!Array.isArray(res)) res = [res];

            for (const embed of res) {
                // Cache with normalized URL
                const cache = EmbedCache.create({
                    url: normalizedUrl,
                    embed: embed,
                });
                cachePromises.push(cache.save());
                data.embeds.push(embed);
            }
        } catch (e) {
            console.error(`[Embeds] Error while generating embed for ${link}`, e);
        }
    }

    await Promise.all([
        emitEvent({
            event: "MESSAGE_UPDATE",
            channel_id: message.channel_id,
            data,
        } as MessageUpdateEvent),
        Message.update({ id: message.id, channel_id: message.channel_id }, { embeds: data.embeds }),
        ...cachePromises,
    ]);
}

export async function sendMessage(opts: MessageOptions) {
    const message = await handleMessage({ ...opts, timestamp: new Date() });

    const ephemeral = (message.flags & Number(MessageFlags.FLAGS.EPHEMERAL)) !== 0;
    await Promise.all([
        Message.insert(message),
        emitEvent({
            event: "MESSAGE_CREATE",
            ...(ephemeral ? { user_id: message.interaction_metadata?.user_id } : { channel_id: message.channel_id }),
            data: message.toJSON(),
        } as MessageCreateEvent),
    ]);

    // no await as it should catch error non-blockingly
    postHandleMessage(message).catch((e) => console.error("[Message] post-message handler failed", e));

    return message;
}

interface MessageOptions extends MessageCreateSchema {
    id?: string;
    type?: MessageType;
    pinned?: boolean;
    author_id?: string;
    webhook_id?: string;
    application_id?: string;
    embeds?: Embed[];
    reactions?: Reaction[];
    channel_id?: string;
    attachments?: (MessageCreateAttachment | MessageCreateCloudAttachment | Attachment)[]; // why are we masking this?
    edited_timestamp?: Date;
    timestamp?: Date;
    username?: string;
    avatar_url?: string;
}
