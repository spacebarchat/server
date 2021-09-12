import { Request, Response, Router } from "express";
import { Config, Permissions, Guild, Invite, Channel, Member } from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { random, route } from "@fosscord/api";

const router: Router = Router();

// Undocumented API notes:
// An invite is created for the widget_channel_id on request (only if an existing one created by the widget doesn't already exist)
// This invite created doesn't include an inviter object like user created ones and has a default expiry of 24 hours
// Missing user object information is intentional (https://github.com/discord/discord-api-docs/issues/1287)
// channels returns voice channel objects where @everyone has the CONNECT permission
// members (max 100 returned) is a sample of all members, and bots par invisible status, there exists some alphabetical distribution pattern between the members returned

// https://discord.com/developers/docs/resources/guild#get-guild-widget
// TODO: Cache the response for a guild for 5 minutes regardless of response
router.get("/", route({}), async (req: Request, res: Response) => {
	const { guild_id } = req.params;

	const guild = await Guild.findOneOrFail({ id: guild_id });
	if (!guild.widget_enabled) throw new HTTPError("Widget Disabled", 404);

	// Fetch existing widget invite for widget channel
	var invite = await Invite.findOne({ channel_id: guild.widget_channel_id });

	if (guild.widget_channel_id && !invite) {
		// Create invite for channel if none exists
		// TODO: Refactor invite create code to a shared function
		const max_age = 86400; // 24 hours
		const expires_at = new Date(max_age * 1000 + Date.now());
		const body = {
			code: random(),
			temporary: false,
			uses: 0,
			max_uses: 0,
			max_age: max_age,
			expires_at,
			created_at: new Date(),
			guild_id,
			channel_id: guild.widget_channel_id,
			inviter_id: null
		};

		invite = await new Invite(body).save();
	}

	// Fetch voice channels, and the @everyone permissions object
	const channels = [] as any[];

	(await Channel.find({ where: { guild_id: guild_id, type: 2 }, order: { position: "ASC" } })).filter((doc) => {
		// Only return channels where @everyone has the CONNECT permission
		if (
			doc.permission_overwrites === undefined ||
			Permissions.channelPermission(doc.permission_overwrites, Permissions.FLAGS.CONNECT) === Permissions.FLAGS.CONNECT
		) {
			channels.push({
				id: doc.id,
				name: doc.name,
				position: doc.position
			});
		}
	});

	// Fetch members
	// TODO: Understand how Discord's max 100 random member sample works, and apply to here (see top of this file)
	let members = await Member.find({ guild_id: guild_id });

	// Construct object to respond with
	const data = {
		id: guild_id,
		name: guild.name,
		instant_invite: invite?.code,
		channels: channels,
		members: members,
		presence_count: guild.presence_count
	};

	res.set("Cache-Control", "public, max-age=300");
	return res.json(data);
});

export default router;
