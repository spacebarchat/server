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

import { route } from "@spacebar/api";
import {
    Channel,
    emitEvent,
    Emoji,
    getPermission,
    Member,
    Message,
    MessageReactionAddEvent,
    MessageReactionRemoveAllEvent,
    MessageReactionRemoveEmojiEvent,
    MessageReactionRemoveEvent,
    User,
    arrayRemove,
    ReactionType,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { In } from "typeorm";
import { PartialEmoji, PublicMemberProjection, PublicUserProjection } from "@spacebar/schemas";
import {
    addReactionUser,
    findReaction,
    getReactionUserIds,
    parseOptionalReactionTypeParam,
    parseReactionTypeParam,
    reactionEventTypeData,
    reactionRemoveEventUserData,
    removeReactionUser,
} from "@spacebar/api/util/utility/ReactionTypes";

const router = Router({ mergeParams: true });
// TODO: check if emoji is really an unicode emoji or a properly encoded external emoji

function getEmoji(emoji: string): PartialEmoji {
    emoji = decodeURIComponent(emoji);
    const parts = emoji.includes(":") && emoji.split(":");
    if (parts)
        return {
            name: parts[0],
            id: parts[1],
        };

    return {
        id: undefined,
        name: emoji,
    };
}

function parseRouteReactionType(value: string): ReactionType {
    const type = parseReactionTypeParam(value);
    if (type === null) throw new HTTPError("Invalid reaction type", 400);
    return type;
}

router.delete(
    "/",
    route({
        permission: "MANAGE_MESSAGES",
        responses: {
            204: {},
            400: {
                body: "APIErrorResponse",
            },
            404: {},
            403: {},
        },
    }),
    async (req: Request, res: Response) => {
        const { message_id, channel_id } = req.params as { [key: string]: string };

        const channel = await Channel.findOneOrFail({
            where: { id: channel_id },
        });

        await Message.update({ id: message_id, channel_id }, { reactions: [] });

        await emitEvent({
            event: "MESSAGE_REACTION_REMOVE_ALL",
            channel_id,
            data: {
                channel_id,
                message_id,
                guild_id: channel.guild_id,
            },
        } satisfies MessageReactionRemoveAllEvent);

        res.sendStatus(204);
    },
);

router.delete(
    "/:emoji",
    route({
        permission: "MANAGE_MESSAGES",
        responses: {
            204: {},
            400: {
                body: "APIErrorResponse",
            },
            404: {},
            403: {},
        },
    }),
    async (req: Request, res: Response) => {
        const { message_id, channel_id } = req.params as { [key: string]: string };
        const emoji = getEmoji(req.params.emoji as string);

        const message = await Message.findOneOrFail({
            where: { id: message_id, channel_id },
        });

        const already_added = findReaction(message.reactions, emoji);
        if (!already_added) throw new HTTPError("Reaction not found", 404);
        arrayRemove(message.reactions, already_added);

        await Promise.all([
            message.save(),
            emitEvent({
                event: "MESSAGE_REACTION_REMOVE_EMOJI",
                channel_id,
                data: {
                    channel_id,
                    message_id,
                    guild_id: message.guild_id,
                    emoji,
                },
            } satisfies MessageReactionRemoveEmojiEvent),
        ]);

        res.sendStatus(204);
    },
);

router.get(
    "/:emoji",
    route({
        permission: "VIEW_CHANNEL",
        query: {
            type: {
                type: "number",
                required: false,
                values: ["0", "1"],
                description: "The type of reaction to return users for.",
            },
        },
        responses: {
            200: {
                body: "PublicUser",
            },
            400: {
                body: "APIErrorResponse",
            },
            404: {},
            403: {},
        },
    }),
    async (req: Request, res: Response) => {
        const { message_id, channel_id } = req.params as { [key: string]: string };
        const limit = req.query.limit ? Number(req.query.limit) : 25;
        const type = parseOptionalReactionTypeParam(req.query.type);
        if (type === null) throw new HTTPError("Invalid reaction type", 400);
        const emoji = getEmoji(req.params.emoji as string);

        const message = await Message.findOneOrFail({
            where: { id: message_id, channel_id },
        });
        const reaction = findReaction(message.reactions, emoji);
        if (!reaction) throw new HTTPError("Reaction not found", 404);
        const userIds = getReactionUserIds(reaction, type);
        if (!userIds.length) return res.json([]);

        const users = (
            await User.find({
                where: {
                    id: In(userIds),
                },
                select: PublicUserProjection,
                take: limit,
            })
        ).map((user) => user.toPublicUser());

        res.json(users);
    },
);

async function addReaction(req: Request, res: Response, type: ReactionType) {
    const { message_id, channel_id, user_id } = req.params as { [key: string]: string };
    if (user_id !== "@me") throw new HTTPError("Invalid user");
    const emoji = getEmoji(req.params.emoji as string);

    const channel = await Channel.findOneOrFail({
        where: { id: channel_id },
    });
    const message = await Message.findOneOrFail({
        where: { id: message_id, channel_id },
    });
    const already_added = findReaction(message.reactions, emoji);

    if (!already_added) req.permission?.hasThrow("ADD_REACTIONS");

    if (emoji.id) {
        const external_emoji = await Emoji.findOneOrFail({
            where: { id: emoji.id },
        });
        if (!already_added && channel.guild_id != external_emoji.guild_id) req.permission?.hasThrow("USE_EXTERNAL_EMOJIS");
        emoji.animated = external_emoji.animated;
        emoji.name = external_emoji.name;
    }

    const result = addReactionUser(message.reactions, emoji, req.user_id, type);
    if (!result.changed) return res.sendStatus(204); // Do not throw an error ¯\_(ツ)_/¯ as discord also doesn't throw any error

    await message.save();

    const member = channel.guild_id
        ? (
              await Member.findOneOrFail({
                  where: { id: req.user_id },
                  relations: { roles: true, user: true },
                  select: {
                      index: true,
                      ...Object.fromEntries(PublicMemberProjection.map((x) => [x, true])),
                      user: Object.fromEntries(PublicUserProjection.map((x) => [x, true])),
                      roles: {
                          id: true,
                      },
                  },
              })
          ).toPublicMember()
        : undefined;

    await emitEvent({
        event: "MESSAGE_REACTION_ADD",
        channel_id,
        data: {
            user_id: req.user_id,
            channel_id,
            message_id,
            guild_id: channel.guild_id,
            emoji,
            member,
            ...reactionEventTypeData(type),
            burst_colors: type === ReactionType.burst ? [] : undefined,
        },
    } satisfies MessageReactionAddEvent);

    res.sendStatus(204);
}

router.put(
    "/:emoji/:user_id",
    route({
        permission: "READ_MESSAGE_HISTORY",
        right: "SELF_ADD_REACTIONS",
        responses: {
            204: {},
            400: {
                body: "APIErrorResponse",
            },
            404: {},
            403: {},
        },
    }),
    async (req: Request, res: Response) => addReaction(req, res, ReactionType.normal),
);

router.put(
    "/:emoji/:type/:user_id",
    route({
        permission: "READ_MESSAGE_HISTORY",
        right: "SELF_ADD_REACTIONS",
        responses: {
            204: {},
            400: {
                body: "APIErrorResponse",
            },
            404: {},
            403: {},
        },
    }),
    async (req: Request, res: Response) => addReaction(req, res, parseRouteReactionType(req.params.type as string)),
);

async function removeReaction(req: Request, res: Response, type: ReactionType) {
    let { user_id } = req.params as { [key: string]: string };
    const { message_id, channel_id } = req.params as { [key: string]: string };

    const emoji = getEmoji(req.params.emoji as string);

    const channel = await Channel.findOneOrFail({
        where: { id: channel_id },
    });
    const message = await Message.findOneOrFail({
        where: { id: message_id, channel_id },
    });

    if (user_id === "@me") user_id = req.user_id;
    else {
        const permissions = await getPermission(req.user_id, undefined, channel_id);
        permissions.hasThrow("MANAGE_MESSAGES");
    }

    const already_added = findReaction(message.reactions, emoji);
    if (!already_added || !removeReactionUser(already_added, user_id, type)) throw new HTTPError("Reaction not found", 404);

    if (already_added.count <= 0) arrayRemove(message.reactions, already_added);

    await message.save();

    await emitEvent({
        event: "MESSAGE_REACTION_REMOVE",
        channel_id,
        data: {
            ...reactionRemoveEventUserData(user_id, type),
            channel_id,
            message_id,
            guild_id: channel.guild_id,
            emoji,
        },
    } satisfies MessageReactionRemoveEvent);

    res.sendStatus(204);
}

router.delete(
    "/:emoji/:user_id",
    route({
        responses: {
            204: {},
            400: {
                body: "APIErrorResponse",
            },
            404: {},
            403: {},
        },
    }),
    async (req: Request, res: Response) => removeReaction(req, res, ReactionType.normal),
);

router.delete(
    "/:emoji/:type/:user_id",
    route({
        responses: {
            204: {},
            400: {
                body: "APIErrorResponse",
            },
            404: {},
            403: {},
        },
    }),
    async (req: Request, res: Response) => removeReaction(req, res, parseRouteReactionType(req.params.type as string)),
);

export default router;
