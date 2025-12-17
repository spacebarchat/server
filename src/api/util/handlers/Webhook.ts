import { handleMessage, postHandleMessage } from "@spacebar/api";
import { Attachment, Config, DiscordApiErrors, emitEvent, FieldErrors, Message, MessageCreateEvent, uploadFile, ValidateName, Webhook } from "@spacebar/util";
import { Request, Response } from "express";
import { HTTPError } from "lambert-server";
import { MoreThan } from "typeorm";
import { WebhookExecuteSchema } from "@spacebar/schemas";

export const executeWebhook = async (req: Request, res: Response) => {
    const body = req.body as WebhookExecuteSchema;

    const { webhook_id, token } = req.params;

    const webhook = await Webhook.findOne({
        where: {
            id: webhook_id,
        },
        relations: ["channel", "guild", "application"],
    });

    if (!webhook) {
        throw DiscordApiErrors.UNKNOWN_WEBHOOK;
    }

    if (webhook.token !== token) {
        throw DiscordApiErrors.INVALID_WEBHOOK_TOKEN_PROVIDED;
    }

    if (body.username) {
        ValidateName(body.username);
    }

    // ensure one of content, embeds, components, or file is present
    if (!body.content && !body.embeds && !body.components && !body.file && !body.attachments) {
        throw DiscordApiErrors.CANNOT_SEND_EMPTY_MESSAGE;
    }

    const wait = req.query.wait === "true";

    if (!wait) {
        res.status(204).send();
    }

    const attachments: Attachment[] = [];

    if (!webhook.channel.isWritable()) {
        if (wait) {
            throw new HTTPError(`Cannot send messages to channel of type ${webhook.channel.type}`, 400);
        } else {
            return;
        }
    }

    // TODO: creating messages by users checks if the user can bypass rate limits, we cant do that on webhooks, but maybe we could check the application if there is one?
    const limits = Config.get().limits;
    if (limits.absoluteRate.register.enabled) {
        const count = await Message.count({
            where: {
                channel_id: webhook.channel_id,
                timestamp: MoreThan(new Date(Date.now() - limits.absoluteRate.sendMessage.window)),
            },
        });

        if (count >= limits.absoluteRate.sendMessage.limit)
            if (wait) {
                throw FieldErrors({
                    channel_id: {
                        code: "TOO_MANY_MESSAGES",
                        message: req.t("common:toomany.MESSAGE"),
                    },
                });
            } else {
                return;
            }
    }

    const files = (req.files as Express.Multer.File[]) ?? [];
    for (const currFile of files) {
        try {
            const file = await uploadFile(`/attachments/${webhook.channel.id}`, currFile);
            attachments.push(Attachment.create({ ...file, proxy_url: file.url }));
        } catch (error) {
            if (wait) res.status(400).json({ message: error?.toString() });
            return;
        }
    }

    const embeds = body.embeds || [];
    const message = await handleMessage({
        ...body,
        username: body.username || webhook.name,
        avatar_url: body.avatar_url || webhook.avatar,
        type: 0,
        pinned: false,
        webhook_id: webhook.id,
        application_id: webhook.application?.id,
        embeds,
        // TODO: Support thread_id/thread_name once threads are implemented
        channel_id: webhook.channel_id,
        attachments,
        timestamp: new Date(),
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore dont care2
    message.edited_timestamp = null;

    webhook.channel.last_message_id = message.id;

    await Promise.all([
        message.save(),
        webhook.channel.save(),
        emitEvent({
            event: "MESSAGE_CREATE",
            channel_id: webhook.channel_id,
            data: message,
        } as MessageCreateEvent),
    ]);

    // no await as it shouldnt block the message send function and silently catch error
    postHandleMessage(message).catch((e) => console.error("[Message] post-message handler failed", e));
    if (wait) res.json(message);
    return;
};
