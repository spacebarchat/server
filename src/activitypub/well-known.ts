import { route } from "@spacebar/api";
import {
	ActorType,
	Channel,
	Config,
	FederationKey,
	FieldErrors,
	Guild,
	User,
	WebfingerResponse,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { splitQualifiedMention } from "./federation";
const router = Router();

router.get(
	"/webfinger",
	route({
		query: {
			resource: {
				type: "string",
				description: "Resource to locate",
			},
		},
		responses: {
			200: {
				body: "WebfingerResponse",
			},
		},
	}),
	async (req: Request, res: Response<WebfingerResponse>) => {
		let resource = req.query.resource as string;
		if (!resource)
			throw FieldErrors({
				resource: { message: "Resource must be present" },
			});

		// We know what you mean
		resource = resource.replace("acct:", "");

		const { accountDomain, host } = Config.get().federation;

		const { user, domain } = splitQualifiedMention(resource);
		if (domain != accountDomain)
			throw new HTTPError("Resource could not be found", 404);

		const keys = await FederationKey.findOneOrFail({
			where: {
				actorId: user,
				domain,
			},
			select: ["type"],
		});

		let entity: User | Channel | Guild;
		switch (keys.type) {
			case ActorType.USER:
				entity = await User.findOneOrFail({ where: { id: user } });
				break;
			case ActorType.CHANNEL:
				entity = await Channel.findOneOrFail({ where: { id: user } });
				break;
			case ActorType.GUILD:
				entity = await Guild.findOneOrFail({ where: { id: user } });
				break;
		}

		res.setHeader("Content-Type", "application/jrd+json");
		return res.json({
			subject: `acct:${user}@${accountDomain}`, // mastodon always returns acct so might as well
			aliases: [`https://${host}/federation/${keys.type}/${entity.id}`],
			links: [
				{
					rel: "self",
					type: "application/activity+json",
					href: `https://${host}/federation/${keys.type}/${entity.id}`,
				},
				// {
				// 	rel: "http://ostatus.org/schema/1.0/subscribe",
				// 	href: `"https://${host}/fed/authorize-follow?acct={uri}"`,
				// },
			],
		});
	},
);

router.get("/host-meta", route({}), (req, res) => {
	res.setHeader("Content-Type", "application/xrd+xml");

	const { host } = Config.get().federation;

	const ret = `<?xml version="1.0" encoding="UTF-8"?>
	<XRD
		xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0">
		<Link rel="lrdd" type="application/xrd+xml" template="https://${host}/.well-known/webfinger?resource={uri}"/>
	</XRD>`;

	return res.send(ret);
});

export default router;
