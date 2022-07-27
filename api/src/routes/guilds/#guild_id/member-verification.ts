import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import { emitEvent, Guild, GuildUpdateEvent, MemberVerificationForm, MemberVerificationFormField } from "@fosscord/util";
const router = Router();

export interface GuildUpdateMemberVerificationSchema {
	description?: string;
	form_fields?: MemberVerificationFormField[];
	enabled?: boolean;
}

router.get("/", route({}), async (req: Request, res: Response) => {
	const { guild_id } = req.params;

	const form = await MemberVerificationForm.findOne({ id: guild_id });
	if (!form)
		return res.status(404).json({
			message: "Unknown Guild Member Verification Form",
			code: 10068
		});

	res.json(form);
});

router.patch(
	"/",
	route({ body: "GuildUpdateMemberVerificationSchema", permission: "MANAGE_GUILD" }),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;
		const body = req.body as GuildUpdateMemberVerificationSchema;

		const guild = await Guild.findOneOrFail({
			where: { id: guild_id },
			relations: ["emojis", "roles", "stickers"]
		});
		let form = await MemberVerificationForm.findOne({ id: guild_id });

		if (!form)
			form = await new MemberVerificationForm({
				form_fields: [],
				...body,
				id: guild_id,
				version: new Date()
			}).save();
		else {
			form.assign(body);
			form.version = new Date();
			await form.save();
		}

		if (body.enabled !== null) {
			if (body.enabled === true) {
				guild.features.push("MEMBER_VERIFICATION_GATE_ENABLED");
			} else {
				guild.features = guild.features.remove("MEMBER_VERIFICATION_GATE_ENABLED");
			}

			await Promise.all([guild.save(), emitEvent({ event: "GUILD_UPDATE", data: guild.toJSON(), guild_id } as GuildUpdateEvent)]);
		}

		res.json(form);
	}
);

export default router;
