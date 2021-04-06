import { CLOSECODES, Payload, OPCODES } from "../util/Constants";
import WebSocket from "../util/WebSocket";
import {
	ChannelModel,
	checkToken,
	GuildModel,
	Intents,
	MemberDocument,
	MemberModel,
	ReadyEventData,
	UserModel,
} from "fosscord-server-util";
import { setupListener } from "../listener/listener";
import { instanceOf } from "lambert-server";
import { IdentifySchema } from "../schema/Identify";
import { Send } from "../util/Send";
import { EVENTEnum } from "fosscord-server-util";
import experiments from "./experiments.json";
import { check } from "./instanceOf";

// TODO: bot sharding
// TODO: check priviliged intents
// TODO: check if already identified

export async function onIdentify(this: WebSocket, data: Payload) {
	clearTimeout(this.readyTimeout);
	check.call(this, IdentifySchema, data.d);

	const identify: IdentifySchema = data.d;

	try {
		var decoded = await checkToken(identify.token); // will throw an error if invalid
	} catch (error) {
		return this.close(CLOSECODES.Authentication_failed);
	}
	this.user_id = decoded.id;
	if (!identify.intents) identify.intents = BigInt("11111111111111");
	this.intents = new Intents(identify.intents);

	const members = await MemberModel.find({ id: this.user_id }).lean().exec();
	const merged_members = members.map((x: any) => {
		const y = { ...x, user_id: x.id };
		delete y.settings;
		delete y.id;
		return [y];
	}) as MemberDocument[][];
	const user_guild_settings_entries = members.map((x) => x.settings);

	const channels = await ChannelModel.find({ recipients: this.user_id }).lean().exec();
	const user = await UserModel.findOne({ id: this.user_id }).lean().exec();
	const public_user = {
		username: user.username,
		discriminator: user.discriminator,
		id: user.id,
		public_flags: user.public_flags,
		avatar: user.avatar,
		bot: user.bot,
	};

	const guilds = await GuildModel.find({ id: { $in: user.guilds } })
		.populate("channels")
		.populate("roles")
		.populate("emojis")
		.populate({ path: "joined_at", match: { id: this.user_id } })
		.lean()
		.exec();

	const privateUser = {
		avatar: user.avatar,
		mobile: user.mobile,
		desktop: user.desktop,
		discriminator: user.discriminator,
		email: user.email,
		flags: user.flags,
		id: user.id,
		mfa_enabled: user.mfa_enabled,
		nsfw_allowed: user.nsfw_allowed,
		phone: user.phone,
		premium: user.premium,
		premium_type: user.premium_type,
		public_flags: user.public_flags,
		username: user.username,
		verified: user.verified,
		bot: user.bot,
	};

	const d: ReadyEventData = {
		v: 8,
		user: privateUser,
		user_settings: user.user_settings,
		// @ts-ignore
		guilds: guilds.map((x) => {
			// @ts-ignore
			x.guild_hashes = {
				channels: { omitted: false, hash: "y4PV2fZ0gmo" },
				metadata: { omitted: false, hash: "bs1/ckvud3Y" },
				roles: { omitted: false, hash: "SxA+c5CaYpo" },
				version: 1,
			};
			return x;
		}),
		guild_experiments: [], // TODO
		geo_ordered_rtc_regions: [], // TODO
		relationships: [], // TODO
		read_state: {
			// TODO
			entries: [],
			partial: false,
			version: 304128,
		},
		user_guild_settings: {
			entries: user_guild_settings_entries,
			partial: false, // TODO partial
			version: 642,
		},
		private_channels: channels,
		session_id: "", // TODO
		analytics_token: "", // TODO
		connected_accounts: [], // TODO
		consents: {
			personalization: {
				consented: false, // TODO
			},
		},
		country_code: user.user_settings.locale,
		friend_suggestion_count: 0, // TODO
		// @ts-ignore
		experiments: experiments, // TODO
		guild_join_requests: [], // TODO what is this?
		users: [public_user], // TODO
		merged_members: merged_members,
		// shard // TODO: only for bots sharding
		// application // TODO for applications
	};

	console.log("Send ready");

	// TODO: send real proper data structure
	await Send(this, {
		op: OPCODES.Dispatch,
		t: EVENTEnum.Ready,
		s: this.sequence++,
		d,
	});

	await setupListener.call(this);
}
