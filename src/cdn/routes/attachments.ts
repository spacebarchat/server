import { Router, Response, Request } from "express";
import { Config, Snowflake } from "@fosscord/util";
import { storage } from "../util/Storage";
import FileType from "file-type";
import { HTTPError } from "lambert-server";
import { multer } from "../util/multer";
import imageSize from "image-size";
import ffmpeg from "fluent-ffmpeg";
import Path from "path";
import { Duplex, Readable, Transform, Writable } from "stream";

const router = Router();

const SANITIZED_CONTENT_TYPE = [
	"text/html",
	"text/mhtml",
	"multipart/related",
	"application/xhtml+xml",
];

const probe = (file: string): Promise<ffmpeg.FfprobeData> => new Promise((resolve, reject) => {
	ffmpeg.setFfprobePath(process.env.FFPROBE_PATH as string);
	ffmpeg.ffprobe(file, (err, data) => {
		if (err) return reject(err);
		return resolve(data);
	});
});

router.post(
	"/:channel_id",
	multer.single("file"),
	async (req: Request, res: Response) => {
		if (req.headers.signature !== Config.get().security.requestSignature)
			throw new HTTPError("Invalid request signature");
		if (!req.file) throw new HTTPError("file missing");

		const { buffer, mimetype, size, originalname, fieldname } = req.file;
		const { channel_id } = req.params;
		const filename = originalname
			.replaceAll(" ", "_")
			.replace(/[^a-zA-Z0-9._]+/g, "");
		const id = Snowflake.generate();
		const path = `attachments/${channel_id}/${id}/${filename}`;

		const endpoint =
			Config.get()?.cdn.endpointPublic || "http://localhost:3003";

		await storage.set(path, buffer);
		var width;
		var height;
		if (mimetype.includes("image")) {
			const dimensions = imageSize(buffer);
			if (dimensions) {
				width = dimensions.width;
				height = dimensions.height;
			}
		}
		else if (mimetype.includes("video") && process.env.FFPROBE_PATH) {
			const root = process.env.STORAGE_LOCATION || "../";	// hmm, stolen from FileStorage
			const out = await probe(Path.join(root, path));
			const stream = out.streams[0];	// hmm
			width = stream.width;
			height = stream.height;
		}

		const file = {
			id,
			content_type: mimetype,
			filename: filename,
			size,
			url: `${endpoint}/${path}`,
			width,
			height,
		};

		return res.json(file);
	},
);

router.get(
	"/:channel_id/:id/:filename",
	async (req: Request, res: Response) => {
		const { channel_id, id, filename } = req.params;
		const { format } = req.query;

		const path = `attachments/${channel_id}/${id}/${filename}`;
		let file = await storage.get(path);
		if (!file) throw new HTTPError("File not found");
		const type = await FileType.fromBuffer(file);
		let content_type = type?.mime || "application/octet-stream";

		if (SANITIZED_CONTENT_TYPE.includes(content_type)) {
			content_type = "application/octet-stream";
		}

		// lol, super gross
		if (content_type.includes("video") && format == "jpeg" && process.env.FFMPEG_PATH) {
			const promise = (): Promise<Buffer> => new Promise((resolve, reject) => {
				ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH as string);
				const out: any[] = [];
				const cmd = ffmpeg(Readable.from(file as Buffer))
					.format("mjpeg")
					.frames(1)
					.on("end", () => resolve(Buffer.concat(out)))
					.on("error", (err) => reject(err))
				const stream = cmd.pipe();
				stream.on("data", (data) => {
					out.push(data)
				});
			});
			const res = await promise();
			file = res;
			content_type = "jpeg";
		}

		res.set("Content-Type", content_type);
		res.set("Cache-Control", "public, max-age=31536000");

		return res.send(file);
	},
);

router.delete(
	"/:channel_id/:id/:filename",
	async (req: Request, res: Response) => {
		if (req.headers.signature !== Config.get().security.requestSignature)
			throw new HTTPError("Invalid request signature");

		const { channel_id, id, filename } = req.params;
		const path = `attachments/${channel_id}/${id}/${filename}`;

		await storage.delete(path);

		return res.send({ success: true });
	},
);

export default router;
