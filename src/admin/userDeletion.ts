import { Message, MessageDeleteBulkEvent, Session, User, emitEvent } from "@spacebar/util";
import { HTTPError } from "lambert-server";
import { IsNull } from "typeorm";
import { AdminEventEmitter } from "./mutations";
import { AdminJobContext, AdminJobSnapshot, createAdminJob } from "./jobs";

export interface UserDeletionJobInput {
    userId: string;
    deleteMessages: boolean;
    messageDeleteChunkSize: number;
}

export interface UserDeletionJobResult {
    userId: string;
    disabled: boolean;
    deleted: boolean;
    sessionsInvalidated: number;
    messagesDeleted: number;
    channelsProcessed: number;
}

interface MessageChannelRow {
    channelId: string;
    guildId: string | null;
    messageCount: string;
}

const DEFAULT_MESSAGE_DELETE_CHUNK_SIZE = 100;
const MAX_MESSAGE_DELETE_CHUNK_SIZE = 1000;

function firstQueryValue(value: unknown): string | undefined {
    if (Array.isArray(value)) return firstQueryValue(value[0]);
    return typeof value === "string" ? value : undefined;
}

function parseBoolean(value: unknown, fallback: boolean) {
    if (value === undefined) return fallback;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return ["1", "true", "yes", "on"].includes(value.toLowerCase());
    return fallback;
}

function parseChunkSize(value: unknown) {
    const raw = firstQueryValue(value);
    const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_MESSAGE_DELETE_CHUNK_SIZE;
    if (!Number.isFinite(parsed)) return DEFAULT_MESSAGE_DELETE_CHUNK_SIZE;

    return Math.min(Math.max(parsed, 1), MAX_MESSAGE_DELETE_CHUNK_SIZE);
}

export function parseUserDeletionJobInput(userId: string, body: unknown, query: Record<string, unknown> = {}): UserDeletionJobInput {
    const input = typeof body === "object" && body !== null && !Array.isArray(body) ? (body as Record<string, unknown>) : {};

    return {
        userId,
        deleteMessages: parseBoolean(input.deleteMessages, true),
        messageDeleteChunkSize: parseChunkSize(input.messageDeleteChunkSize ?? query.message_delete_chunk_size ?? query.messageDeleteChunkSize),
    };
}

async function invalidateUserSessions(userId: string, emitter: AdminEventEmitter) {
    const sessions = await Session.find({ where: { user_id: userId } });
    await Session.delete({ user_id: userId });

    for (const session of sessions) {
        await emitter({
            session_id: session.session_id,
            event: "SB_SESSION_REMOVE",
            origin: "Admin API (user delete job)",
        });
    }

    return sessions.length;
}

async function markUserDeleted(userId: string) {
    const user = await User.findOne({
        where: { id: userId },
        select: ["id", "data", "deleted", "disabled", "rights"],
    });
    if (!user) throw new HTTPError("User not found", 404);

    user.data = {
        ...(user.data ?? {}),
        hash: undefined,
        valid_tokens_since: new Date(),
    };
    user.deleted = true;
    user.disabled = true;
    user.rights = "0";

    await user.save();
}

async function getUserMessageChannels(userId: string): Promise<MessageChannelRow[]> {
    return Message.createQueryBuilder("message")
        .select("message.channel_id", "channelId")
        .addSelect("message.guild_id", "guildId")
        .addSelect("COUNT(*)", "messageCount")
        .where("message.author_id = :userId", { userId })
        .andWhere("message.channel_id IS NOT NULL")
        .groupBy("message.channel_id")
        .addGroupBy("message.guild_id")
        .getRawMany<MessageChannelRow>();
}

async function getMessageIdsForChannel(userId: string, channelId: string, guildId: string | null, limit: number) {
    const qb = Message.createQueryBuilder("message")
        .select("message.id", "id")
        .where("message.author_id = :userId", { userId })
        .andWhere("message.channel_id = :channelId", { channelId })
        .orderBy("message.id", "ASC")
        .limit(limit);

    if (guildId === null) qb.andWhere("message.guild_id IS NULL");
    else qb.andWhere("message.guild_id = :guildId", { guildId });

    const rows = await qb.getRawMany<{ id: string }>();
    return rows.map((row) => row.id);
}

async function deleteUserMessages(input: UserDeletionJobInput, context: AdminJobContext<UserDeletionJobResult>, emitter: AdminEventEmitter) {
    const channels = await getUserMessageChannels(input.userId);
    const totalMessages = channels.reduce((total, channel) => total + Number(channel.messageCount), 0);
    let deleted = 0;

    context.setProgress({
        current: 0,
        total: totalMessages,
        label: "Deleting user messages",
    });

    for (const channel of channels) {
        context.throwIfCancellationRequested();

        while (true) {
            context.throwIfCancellationRequested();
            const ids = await getMessageIdsForChannel(input.userId, channel.channelId, channel.guildId, input.messageDeleteChunkSize);
            if (ids.length === 0) break;

            await Message.delete(ids);
            deleted += ids.length;
            context.setProgress({ current: deleted });
            await emitter({
                event: "MESSAGE_DELETE_BULK",
                channel_id: channel.channelId,
                data: {
                    ids,
                    channel_id: channel.channelId,
                    guild_id: channel.guildId ?? undefined,
                },
            } satisfies Omit<MessageDeleteBulkEvent, "created_at">);
        }
    }

    const orphanedMessages = await Message.countBy({ author_id: input.userId, channel_id: IsNull() });
    if (orphanedMessages > 0) {
        await Message.delete({ author_id: input.userId, channel_id: IsNull() });
        deleted += orphanedMessages;
        context.setProgress({ current: deleted, total: totalMessages + orphanedMessages });
    }

    return {
        messagesDeleted: deleted,
        channelsProcessed: channels.length,
    };
}

export async function runUserDeletionJob(
    input: UserDeletionJobInput,
    context: AdminJobContext<UserDeletionJobResult>,
    emitter: AdminEventEmitter = emitEvent,
): Promise<UserDeletionJobResult> {
    context.setProgress({ current: 0, total: null, label: "Disabling user" });
    await markUserDeleted(input.userId);

    context.throwIfCancellationRequested();
    context.setProgress({ current: 0, total: null, label: "Invalidating sessions" });
    const sessionsInvalidated = await invalidateUserSessions(input.userId, emitter);

    let messagesDeleted = 0;
    let channelsProcessed = 0;
    if (input.deleteMessages) {
        const result = await deleteUserMessages(input, context, emitter);
        messagesDeleted = result.messagesDeleted;
        channelsProcessed = result.channelsProcessed;
    }

    context.setProgress({ current: messagesDeleted, total: messagesDeleted, label: "Complete" });

    return {
        userId: input.userId,
        disabled: true,
        deleted: true,
        sessionsInvalidated,
        messagesDeleted,
        channelsProcessed,
    };
}

export function startUserDeletionJob(options: {
    input: UserDeletionJobInput;
    createdBy: string;
    idempotencyKey?: string | null;
}): AdminJobSnapshot<UserDeletionJobInput, UserDeletionJobResult> {
    return createAdminJob({
        type: "user.delete",
        input: options.input,
        createdBy: options.createdBy,
        idempotencyKey: options.idempotencyKey,
        runner: (context) => runUserDeletionJob(options.input, context),
    });
}
