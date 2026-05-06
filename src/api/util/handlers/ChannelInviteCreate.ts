import { randomString } from "../utility/RandomInviteID";
import { Channel, Guild, Invite, InviteCreateEvent, User, emitEvent, normalizeInviteCreateOptions } from "@spacebar/util";
import { HTTPError } from "lambert-server";
import { InviteCreateSchema, isTextChannel } from "@spacebar/schemas";

export async function createChannelInvite(user_id: string, channel_id: string, body: InviteCreateSchema) {
    const channel = await Channel.findOneOrFail({
        where: { id: channel_id },
        select: { id: true, name: true, type: true, guild_id: true },
    });
    isTextChannel(channel.type);

    if (!channel.guild_id) {
        throw new HTTPError("This channel doesn't exist", 404);
    }
    const { guild_id } = channel;

    const inviteOptions = normalizeInviteCreateOptions(body);
    const inviteContext = {
        guild_id,
        channel_id,
        inviter_id: user_id,
    };

    const existingInvite = await Invite.findReusableForCreate(inviteContext, inviteOptions);
    if (existingInvite) {
        const data = existingInvite.toJSON();
        data.inviter = await User.getPublicUser(user_id);
        data.guild = await Guild.findOne({ where: { id: guild_id } });
        data.channel = channel;

        return { status: 200, data };
    }

    const invite = await Invite.createForChannel(randomString(), inviteContext, inviteOptions).save();

    const data = invite.toJSON();
    data.inviter = await User.getPublicUser(user_id);
    data.guild = await Guild.findOne({ where: { id: guild_id } });
    data.channel = channel;

    await emitEvent({
        event: "INVITE_CREATE",
        data,
        guild_id,
    } satisfies InviteCreateEvent);

    return { status: 201, data };
}
