import { Request, Response, Router } from "express";
import { Config, Permissions, GuildModel, InviteModel, ChannelModel, MemberModel } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { random } from "../../../util/RandomInviteID";

const router: Router = Router();

// Undocumented API notes:
// An invite is created for the widget_channel_id on request (only if an existing one created by the widget doesn't already exist)
// This invite created doesn't include an inviter object like user created ones and has a default expiry of 24 hours
// Missing user object information is intentional (https://github.com/discord/discord-api-docs/issues/1287)
// channels returns voice channel objects where @everyone has the CONNECT permission
// members (max 100 returned) is a sample of all members, and bots par invisible status, there exists some alphabetical distribution pattern between the members returned

// https://discord.com/developers/docs/resources/guild#get-guild-widget
// TODO: Cache the response for a guild for 5 minutes regardless of response
router.get("/", async (req: Request, res: Response) => {
	const { guild_id } = req.params;

	const guild = await GuildModel.findOne({ id: guild_id }).exec();
	if (!guild.widget_enabled) throw new HTTPError("Widget Disabled", 404);

	// Fetch existing widget invite for widget channel
	var invite = await InviteModel.findOne({ channel_id: guild.widget_channel_id, inviter_id: { $type: 10 } }).exec();
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

		invite = await new InviteModel(body).save();
	}

	// Fetch voice channels, and the @everyone permissions object
	let channels: any[] = [];
	await ChannelModel.find({ guild_id: guild_id, type: 2 }, { permission_overwrites: { $elemMatch: { id: guild_id } } })
		.lean()
		.select("id name position permission_overwrites")
		.sort({ position: 1 })
		.cursor()
		.eachAsync((doc) => {
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
	let members: any[] = [];
	await MemberModel.find({ guild_id: guild_id })
		.lean()
		.populate({ path: "user", select: { _id: 0, username: 1, avatar: 1, presence: 1 } })
		.select("id user nick deaf mute")
		.cursor()
		.eachAsync((doc) => {
			const status = doc.user?.presence?.status || "offline";
			if (status == "offline") return;

			let item = {};

			item = {
				...item,
				id: null, // this is updated during the sort outside of the query
				username: doc.nick || doc.user?.username,
				discriminator: "0000", // intended (https://github.com/discord/discord-api-docs/issues/1287)
				avatar: null, // intended, avatar_url below will return a unique guild + user url to the avatar
				status: status
			};

			const activity = doc.user?.presence?.activities?.[0];
			if (activity) {
				item = {
					...item,
					game: { name: activity.name }
				};
			}

			// TODO: If the member is in a voice channel, return extra widget details
			// Extra fields returned include deaf, mute, self_deaf, self_mute, supress, and channel_id (voice channel connected to)
			// Get this from VoiceState

			// TODO: Implement a widget-avatar endpoint on the CDN, and implement logic here to request it
			// Get unique avatar url for guild user, cdn to serve the actual avatar image on this url
			/*
		const avatar = doc.user?.avatar;
		if (avatar) {
			const CDN_HOST = Config.get().cdn.endpoint || "http://localhost:3003";
			const avatar_url = "/widget-avatars/" + ;
			item = {
				...item,
				avatar_url: avatar_url
			}
		}
		*/

			members.push(item);
		});

	// Sort members, and update ids (Unable to do under the mongoose query due to https://mongoosejs.com/docs/faq.html#populate_sort_order)
	members = members.sort((first, second) => 0 - (first.username > second.username ? -1 : 1));
	members.forEach((x, i) => {
		x.id = i;
	});

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
