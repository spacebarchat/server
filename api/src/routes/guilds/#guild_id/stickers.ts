import { Member, Sticker } from "@fosscord/util";
import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import multer from "multer";
const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	await Member.IsInGuildOrFail(req.user_id, guild_id);

	res.json(await Sticker.find({ guild_id }));
});

const bodyParser = multer({
	limits: {
		fileSize: 1024 * 1024 * 100,
		fields: 10,
		files: 1
	},
	storage: multer.memoryStorage()
}).single("file");

router.post("/", bodyParser, route({ permission: "MANAGE_EMOJIS_AND_STICKERS" }), async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	await Member.IsInGuildOrFail(req.user_id, guild_id);

	res.json(await Sticker.find({ guild_id }));
});

router.get("/:sticker_id", route({}), async (req: Request, res: Response) => {
	const { guild_id, sticker_id } = req.params;
	await Member.IsInGuildOrFail(req.user_id, guild_id);

	res.json(await Sticker.findOneOrFail({ guild_id, id: sticker_id }));
});

export interface ModifyGuildStickerSchema {
	/**
	 * @minLength 2
	 * @maxLength 30
	 */
	name: string;
	/**
	 * @minLength 2
	 * @maxLength 100
	 */
	description?: string;
	/**
	 * @maxLength 200
	 */
	tags: string;
}

router.patch(
	"/:sticker_id",
	route({ body: "ModifyGuildStickerSchema", permission: "MANAGE_EMOJIS_AND_STICKERS" }),
	async (req: Request, res: Response) => {
		const { guild_id, sticker_id } = req.params;
		const body = req.body as ModifyGuildStickerSchema;

		const sticker = await new Sticker({ ...body, guild_id, id: sticker_id }).save();
		return res.json(sticker);
	}
);

router.delete("/:sticker_id", route({ permission: "MANAGE_EMOJIS_AND_STICKERS" }), async (req: Request, res: Response) => {
	const { guild_id, sticker_id } = req.params;

	await Sticker.delete({ guild_id, id: sticker_id });

	return res.sendStatus(204);
});

export default router;
