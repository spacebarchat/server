import {
	emitEvent,
	GuildStickersUpdateEvent,
	handleFile,
	Member,
	Snowflake,
	Sticker,
	StickerFormatType,
	StickerType,
	uploadFile
} from "@fosscord/util";
import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import multer from "multer";
import { HTTPError } from "lambert-server";
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

router.post(
	"/",
	bodyParser,
	route({ permission: "MANAGE_EMOJIS_AND_STICKERS", body: "ModifyGuildStickerSchema" }),
	async (req: Request, res: Response) => {
		if (!req.file) throw new HTTPError("missing file");

		const { guild_id } = req.params;
		const body = req.body as ModifyGuildStickerSchema;
		const id = Snowflake.generate();

		const [sticker] = await Promise.all([
			new Sticker({
				...body,
				guild_id,
				id,
				type: StickerType.GUILD,
				format_type: getStickerFormat(req.file.mimetype),
				available: true
			}).save(),
			uploadFile(`/stickers/${id}`, req.file)
		]);

		await sendStickerUpdateEvent(guild_id);

		res.json(sticker);
	}
);

export function getStickerFormat(mime_type: string) {
	switch (mime_type) {
		case "image/apng":
			return StickerFormatType.APNG;
		case "application/json":
			return StickerFormatType.LOTTIE;
		case "image/png":
			return StickerFormatType.PNG;
		case "image/gif":
			return StickerFormatType.GIF;
		default:
			throw new HTTPError("invalid sticker format: must be png, apng or lottie");
	}
}

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
		await sendStickerUpdateEvent(guild_id);

		return res.json(sticker);
	}
);

async function sendStickerUpdateEvent(guild_id: string) {
	return emitEvent({
		event: "GUILD_STICKERS_UPDATE",
		guild_id: guild_id,
		data: {
			guild_id: guild_id,
			stickers: await Sticker.find({ guild_id: guild_id })
		}
	} as GuildStickersUpdateEvent);
}

router.delete("/:sticker_id", route({ permission: "MANAGE_EMOJIS_AND_STICKERS" }), async (req: Request, res: Response) => {
	const { guild_id, sticker_id } = req.params;

	await Sticker.delete({ guild_id, id: sticker_id });
	await sendStickerUpdateEvent(guild_id);

	return res.sendStatus(204);
});

export default router;
