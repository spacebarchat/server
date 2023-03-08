/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Request, Response, Router } from "express";
import FileType from "file-type";
import fs from "fs/promises";
import { HTTPError } from "lambert-server";
import { join } from "path";

const defaultAvatarHashMap = new Map([
	["0", "1f0bfc0865d324c2587920a7d80c609b"],
	["1", "c09a43a372ba81e3018c3151d4ed4773"],
	["2", "7c8f476123d28d103efe381543274c25"],
	["3", "6f26ddd1bf59740c536d2274bb834a05"],
	["4", "3c6ccb83716d1e4fb91d3082f6b21d77"],
	["5", "4c1b599b1ef5b9f1874fdb9933f3e03b"],
]);

const defaultGroupDMAvatarHashMap = new Map([
	["0", "3b70bb66089c60f8be5e214bf8574c9d"],
	["1", "9581acd31832465bdeaa5385b0e919a3"],
	["2", "a8a4727cf2dc2939bd3c657fad4463fa"],
	["3", "2e46fe14586f8e95471c0917f56726b5"],
	["4", "fac7e78de9753d4a37083bba74c1d9ef"],
	["5", "4ab900144b0865430dc9be825c838faa"],
	["6", "1276374a404452756f3c9cc2601508a5"],
	["7", "904bf9f1b61f53ef4a3b7a893afeabe3"],
]);

const router = Router();

async function getFile(path: string) {
	try {
		return fs.readFile(path);
	} catch (error) {
		try {
			const files = await fs.readdir(path);
			if (!files.length) return null;
			return fs.readFile(join(path, files[0]));
		} catch (error) {
			return null;
		}
	}
}

router.get("/avatars/:id", async (req: Request, res: Response) => {
	let { id } = req.params;
	id = id.split(".")[0]; // remove .file extension
	const hash = defaultAvatarHashMap.get(id);
	if (!hash) throw new HTTPError("not found", 404);
	const path = join(process.cwd(), "assets", "public", `${hash}.png`);

	const file = await getFile(path);
	if (!file) throw new HTTPError("not found", 404);
	const type = await FileType.fromBuffer(file);

	res.set("Content-Type", type?.mime);
	res.set("Cache-Control", "public, max-age=31536000");

	return res.send(file);
});

router.get("/group-avatars/:id", async (req: Request, res: Response) => {
	let { id } = req.params;
	id = id.split(".")[0]; // remove .file extension
	const hash = defaultGroupDMAvatarHashMap.get(id);
	if (!hash) throw new HTTPError("not found", 404);
	const path = join(process.cwd(), "assets", "public", `${hash}.png`);

	const file = await getFile(path);
	if (!file) throw new HTTPError("not found", 404);
	const type = await FileType.fromBuffer(file);

	res.set("Content-Type", type?.mime);
	res.set("Cache-Control", "public, max-age=31536000");

	return res.send(file);
});

export default router;
