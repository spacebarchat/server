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

import { randomBytes } from "node:crypto";
import { Request, Response, Router } from "express";
import { IsNull } from "typeorm";
import {
    InteractionFailureReason,
    InteractionSchema,
    InteractionType,
    InteractionCreateSchema,
    InteractionData,
    InteractionResolvedData,
    ApplicationCommandOption,
    ApplicationCommandOptionType,
    InteractionResolvedPartialMember,
} from "@spacebar/schemas";
import { route } from "@spacebar/api/middlewares";
import { Guild, Member, Message, Channel, User, Role } from "@spacebar/database";
import { Config, emitEvent, getPermission, InteractionCreateEvent, InteractionFailureEvent, Snowflake } from "@spacebar/util";
import { pendingInteractions } from "@spacebar/util/imports/Interactions";

const router = Router({ mergeParams: true });

router.post("/", route({}), async (req: Request, res: Response) => {
    const body = req.body as InteractionSchema;

    const interactionId = Snowflake.generate();
    const interactionToken = randomBytes(24).toString("base64url");

    await emitEvent({
        event: "INTERACTION_CREATE",
        user_id: req.user_id,
        data: {
            id: interactionId,
            nonce: body.nonce,
        },
    } satisfies InteractionCreateEvent);

    const user = req.user;
    const channel = await Channel.findOneOrFail({ where: { id: body.channel_id } });
    (await channel.getUserPermissions({ user_id: req.user_id })).hasThrow("USE_APPLICATION_COMMANDS");

    if (body.guild_id) await Member.IsInGuildOrFail(req.user_id, body.guild_id);

    const interactionData: Partial<InteractionCreateSchema> = {
        id: interactionId,
        application_id: body.application_id,
        channel_id: body.channel_id,
        channel: channel.toJSON(),
        type: body.type,
        token: interactionToken,
        version: 1,
        entitlements: [],
        authorizing_integration_owners: { "0": req.user_id },
        attachment_size_limit: Config.get().cdn.maxAttachmentSize,
    };

    if (body.type === InteractionType.ApplicationCommand || body.type === InteractionType.MessageComponent || body.type === InteractionType.ModalSubmit) {
        interactionData.data = body.data;
        const typedData: InteractionData = interactionData.data as InteractionData;
        typedData.resolved = await resolveInteractionDataRecursive(typedData.options, { guild_id: body.guild_id ?? null, channel_id: body.channel_id });
    }

    if (body.type != InteractionType.Ping) {
        interactionData.locale = user?.settings?.locale;
    }

    if (body.guild_id) {
        interactionData.context = 0;
        interactionData.guild_id = body.guild_id;
        interactionData.app_permissions = (await getPermission(body.application_id, body.guild_id, body.channel_id)).bitfield.toString();

        const guild = await Guild.findOneOrFail({ where: { id: body.guild_id } });
        const member = await Member.findOneOrFail({ where: { guild_id: body.guild_id, id: req.user_id }, relations: { user: true, roles: true } });

        interactionData.guild = {
            id: guild.id,
            features: guild.features,
            locale: guild.preferred_locale!,
        };

        interactionData.guild_locale = guild.preferred_locale;
        interactionData.member = member.toPublicMember();
    } else {
        interactionData.user = user.toPublicUser();
        interactionData.app_permissions = (await getPermission(body.application_id, "", body.channel_id)).bitfield.toString();

        if (body.channel_id === body.application_id) {
            interactionData.context = 1;
        } else {
            interactionData.context = 2;
        }
    }

    if (body.type === InteractionType.MessageComponent || body.data.type === InteractionType.ModalSubmit) {
        interactionData.message = (
            await Message.findOneOrFail({
                where: { id: body.message_id, flags: undefined },
                relations: {
                    author: true,
                    webhook: true,
                    application: true,
                    mentions: true,
                    mention_roles: true,
                    mention_channels: true,
                    sticker_items: true,
                    attachments: true,
                    thread: {
                        recipients: {
                            user: true,
                        },
                    },
                },
            })
        ).toJSON();
    }

    await emitEvent({
        event: "INTERACTION_CREATE",
        user_id: body.application_id,
        data: {
            ...interactionData,
            member_id: req.user_id, // TODO: is this correct?
            id: interactionId, // TODO: is this correct?
        },
    } satisfies InteractionCreateEvent);

    const interactionTimeout = setTimeout(() => {
        emitEvent({
            event: "INTERACTION_FAILURE",
            user_id: req.user_id,
            data: {
                id: interactionId,
                nonce: body.nonce,
                reason_code: InteractionFailureReason.TIMEOUT,
            },
        } satisfies InteractionFailureEvent);
    }, 3000);

    pendingInteractions.set(interactionId, {
        timeout: interactionTimeout,
        nonce: body.nonce,
        applicationId: body.application_id,
        userId: req.user_id,
        guildId: body.guild_id,
        channelId: body.channel_id,
        type: body.type,
        commandType: body.data.type,
        commandName: body.data.name,
        messageId: body.message_id,
    });

    res.sendStatus(204);
});

async function resolveInteractionDataRecursive(opts: ApplicationCommandOption[], scope: { guild_id: string | null; channel_id: string }): Promise<InteractionResolvedData> {
    const res: InteractionResolvedData = {};
    for (const opt of opts) {
        switch (opt.type) {
            // resolvable types
            case ApplicationCommandOptionType.USER:
                res.users ??= {};
                res.members ??= {};
                // TODO: different schema, cba to fix right now
                if ("value" in opt && !(<string>opt.value in res.users)) {
                    if (!scope.guild_id) throw new Error("Cannot resolve users/members in non-guild context");
                    const member = await Member.findOneOrFail({ where: { id: opt.value as string, guild_id: scope.guild_id }, relations: { user: true, roles: true } });
                    res.members[opt.value as string] = { ...member.toPublicMember(), mute: undefined, deaf: undefined, user: undefined } as InteractionResolvedPartialMember;
                    res.users[opt.value as string] = member.user.toPartialUser();
                }
                break;
            case ApplicationCommandOptionType.CHANNEL:
                res.channels ??= {};
                // TODO: different schema, cba to fix right now
                if ("value" in opt && !(<string>opt.value in res.channels)) {
                    if (scope.guild_id == null && opt.value != scope.channel_id) throw new Error("Cannot resolve other channels in non-guild context.");
                    const channel = await Channel.findOneOrFail({ where: { guild_id: scope.guild_id ?? IsNull(), id: opt.value as string } });
                    res.channels[opt.value as string] = channel.toJSON();
                }
                break;
            case ApplicationCommandOptionType.ROLE:
                res.roles ??= {};
                // TODO: different schema, cba to fix right now
                if ("value" in opt && !(<string>opt.value in res.roles)) {
                    if (!scope.guild_id) throw new Error("Cannot resolve roles in non-guild context");
                    const role = await Role.findOneOrFail({ where: { guild_id: scope.guild_id, id: opt.value as string } });
                    res.roles[opt.value as string] = role.toJSON();
                }
                break;
            // these can recurse
            case ApplicationCommandOptionType.SUB_COMMAND:
            case ApplicationCommandOptionType.SUB_COMMAND_GROUP:
                if (opt.options?.length) {
                    const _res = await resolveInteractionDataRecursive(opt.options, scope);
                    if (_res.users) {
                        res.users ??= {};
                        res.users = { ...res.users, ..._res.users };
                    }
                    if (_res.roles) {
                        res.roles ??= {};
                        res.roles = { ...res.roles, ..._res.roles };
                    }
                    if (_res.channels) {
                        res.channels ??= {};
                        res.channels = { ...res.channels, ..._res.channels };
                    }
                    if (_res.attachments) {
                        res.attachments ??= {};
                        res.attachments = { ...res.attachments, ..._res.attachments };
                    }
                    if (_res.members) {
                        res.members ??= {};
                        res.members = { ...res.members, ..._res.members };
                    }
                    if (_res.messages) {
                        res.messages ??= {};
                        res.messages = { ...res.messages, ..._res.messages };
                    }
                }
                break;
            // ignored
            case ApplicationCommandOptionType.STRING:
            case ApplicationCommandOptionType.INTEGER:
            case ApplicationCommandOptionType.BOOLEAN:
                break;
            default:
                throw new Error("Unknown application command option type " + opt.type);
        }
    }
    return res;
}

export default router;
