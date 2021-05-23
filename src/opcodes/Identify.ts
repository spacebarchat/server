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
	toObject,
	EVENTEnum,
} from "@fosscord/server-util";
import { setupListener } from "../listener/listener";
import { IdentifySchema } from "../schema/Identify";
import { Send } from "../util/Send";
import experiments from "./experiments.json";
import { check } from "./instanceOf";
import * as Config from "../util/Config";

// TODO: bot sharding
// TODO: check priviliged intents
// TODO: check if already identified

export async function onIdentify(this: WebSocket, data: Payload) {
	clearTimeout(this.readyTimeout);
	check.call(this, IdentifySchema, data.d);

	const identify: IdentifySchema = data.d;

	try {
		const { jwtSecret } = Config.gatewayConfig.getAll().security;
		var decoded = await checkToken(identify.token, jwtSecret); // will throw an error if invalid
	} catch (error) {
		console.error("invalid token", error);
		return this.close(CLOSECODES.Authentication_failed);
	}
	this.user_id = decoded.id;
	if (!identify.intents) identify.intents = 0b11111111111111n;
	this.intents = new Intents(identify.intents);
	if (identify.shard) {
		this.shard_id = identify.shard[0];
		this.shard_count = identify.shard[1];
		if (
			!this.shard_count ||
			!this.shard_id ||
			this.shard_id >= this.shard_count ||
			this.shard_id < 0 ||
			this.shard_count <= 0
		) {
			return this.close(CLOSECODES.Invalid_shard);
		}
	}

	const members = toObject(await MemberModel.find({ id: this.user_id }).exec());
	const merged_members = members.map((x: any) => {
		const y = { ...x, user_id: x.id };
		delete y.settings;
		delete y.id;
		return [y];
	}) as MemberDocument[][];
	const user_guild_settings_entries = members.map((x) => x.settings);

	const channels = await ChannelModel.find({ recipients: this.user_id }).exec();
	const user = await UserModel.findOne({ id: this.user_id }).exec();
	if (!user) return this.close(CLOSECODES.Authentication_failed);

	const public_user = {
		username: user.username,
		discriminator: user.discriminator,
		id: user.id,
		public_flags: user.public_flags,
		avatar: user.avatar,
		bot: user.bot,
	};

	const guilds = await GuildModel.find({ id: { $in: user.guilds } })
		.populate({ path: "joined_at", match: { id: this.user_id } })
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
		guilds: toObject(guilds).map((x) => {
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
		// @ts-ignore
		private_channels: toObject(channels),
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
