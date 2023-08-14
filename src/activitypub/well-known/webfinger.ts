import { route } from "@spacebar/api";
import { Channel, Config, User, WebfingerResponse } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";

const router = Router();
export default router;

router.get(
	"/",
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
		let resource = req.query.resource as string | undefined;
		if (!resource) throw new HTTPError("Must specify resource");

		// we know what you mean, bro
		resource = resource.replace("acct:", "");

		if (resource[0] == "@") resource = resource.slice(1);
		const [resourceId, resourceDomain] = resource.split("@");

		const { webDomain } = Config.get().federation;
		if (resourceDomain != webDomain)
			throw new HTTPError("Resource could not be found", 404);

		const found =
			(await User.findOne({
				where: { id: resourceId },
				select: ["id"],
			})) ||
			(await Channel.findOne({
				where: { id: resourceId },
				select: ["id"],
			}));

		if (!found) throw new HTTPError("Resource could not be found", 404);

		const type = found instanceof Channel ? "channel" : "user";

		res.setHeader("Content-Type", "application/jrd+json; charset=utf-8");
		return res.json({
			subject: `acct:${resourceId}@${webDomain}`, // mastodon always returns acct so might as well
			aliases: [`https://${webDomain}/fed/${type}/${resourceId}`],
			links: [
				{
					rel: "self",
					type: "application/activity+json",
					href: `https://${webDomain}/fed/${type}/${resourceId}`,
				},
				// {
				// 	rel: "http://ostatus.org/schema/1.0/subscribe",
				// 	href: `"https://${webDomain}/fed/authorize-follow?acct={uri}"`,
				// },
			],
		});
	},
);
