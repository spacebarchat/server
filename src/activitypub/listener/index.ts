import {
	APError,
	APObjectIsPerson,
	fetchOpts,
	resolveWebfinger,
} from "@spacebar/ap";
import {
	Channel,
	Config,
	EVENTEnum,
	Event,
	Message,
	MessageCreateEvent,
	OrmUtils,
	RabbitMQ,
	User,
	events,
} from "@spacebar/util";
import crypto from "crypto";
import fetch from "node-fetch";

const sendSignedMessage = async (
	inbox: string,
	sender: `${"user" | "channel"}/${string}`,
	message: object,
	privateKey: string,
) => {
	const digest = crypto
		.createHash("sha256")
		.update(JSON.stringify(message))
		.digest("base64");
	const signer = crypto.createSign("sha256");
	const now = new Date();

	const url = new URL(inbox);
	const inboxFrag = url.pathname;
	const toSign =
		`(request-target): post ${inboxFrag}\n` +
		`host: ${url.hostname}\n` +
		`date: ${now.toUTCString()}\n` +
		`digest: SHA-256=${digest}`;

	signer.update(toSign);
	signer.end();

	const signature = signer.sign(privateKey);
	const sig_b64 = signature.toString("base64");

	const { webDomain } = Config.get().federation;
	const header =
		`keyId="https://${webDomain}/fed/${sender}",` +
		`headers="(request-target) host date digest",` +
		`signature=${sig_b64}`;

	return await fetch(
		inbox,
		OrmUtils.mergeDeep(fetchOpts, {
			method: "POST",
			body: message,
			headers: {
				Host: url.hostname,
				Date: now.toUTCString(),
				Digest: `SHA-256=${digest}`,
				Signature: header,
			},
		}),
	);
};

const onMessage = async (event: MessageCreateEvent) => {
	const channel_id = event.channel_id;
	const channel = await Channel.findOneOrFail({
		where: { id: channel_id },
		relations: {
			recipients: {
				user: true,
			},
		},
	});
	if (channel.isDm()) {
		const message = await Message.findOneOrFail({
			where: { id: event.data.id },
		});
		const apMessage = message.toCreateAP();

		for (const recipient of channel.recipients || []) {
			if (recipient.user.federatedId) {
				const user = await resolveWebfinger(recipient.user.federatedId);
				if (!APObjectIsPerson(user))
					throw new APError("Cannot deliver message");

				if (!user.id) throw new APError("Receiver ID is null?");

				apMessage.to = [user.id];

				const sender = await User.findOneOrFail({
					where: { id: event.data.author_id },
					select: ["privateKey"],
				});

				if (typeof user.inbox != "string")
					throw new APError("inbox must be URL");

				console.log(
					await sendSignedMessage(
						user.inbox,
						`user/${event.data.author_id}`,
						message,
						sender.privateKey,
					).then((x) => x.text()),
				);
			}
		}
	}
};

type ListenerFunc = (event: Event) => Promise<void>;

const listeners = {
	MESSAGE_CREATE: onMessage,
} as Record<EVENTEnum, ListenerFunc>;

export const setupListener = () => {
	if (RabbitMQ.connection)
		throw new APError("Activitypub module has not implemented RabbitMQ");

	// for (const event in listeners) {
	// 	// process.setMaxListeners(process.getMaxListeners() + 1);
	// 	// process.addListener("message", (msg) =>
	// 	// 	listener(msg as ProcessEvent, event, listeners[event as EVENTEnum]),
	// 	// );

	events.setMaxListeners(events.getMaxListeners() + 1);
	events.onAny((event, msg) => listeners[msg.event as EVENTEnum]?.(msg));
	// }
};
