import { Router, Response, Request } from "express";
import {
	Channel,
	ChannelOverride,
	Member,
	UserGuildSettings,
} from "@fosscord/util";
import { route } from "@fosscord/api";

const router = Router();

// This sucks. I would use a DeepPartial, my own or typeorms, but they both generate inncorect schema
export interface UserGuildSettingsSchema
	extends Partial<Omit<UserGuildSettings, "channel_overrides">> {
	channel_overrides: {
		[channel_id: string]: Partial<ChannelOverride>;
	};
}

// GET doesn't exist on discord.com
router.get("/", route({}), async (req: Request, res: Response) => {
	const user = await Member.findOneOrFail({
		where: { id: req.user_id, guild_id: req.params.guild_id },
		select: ["settings"],
	});
	return res.json(user.settings);
});

router.patch(
	"/",
	route({ body: "UserGuildSettingsSchema" }),
	async (req: Request, res: Response) => {
		const body = req.body as UserGuildSettings;

		if (body.channel_overrides) {
			for (var channel in body.channel_overrides) {
				Channel.findOneOrFail({ where: { id: channel } });
			}
		}

		const user = await Member.findOneOrFail({
			where: { id: req.user_id, guild_id: req.params.guild_id },
		});
		user.settings = { ...user.settings, ...body };
		await user.save();

		res.json(user.settings);
	},
);

export default router;
