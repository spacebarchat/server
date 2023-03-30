/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
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

import fs from "fs";
import path from "path";
import i18next, { TFunction } from "i18next";
import i18nextBackend from "i18next-fs-backend";
import { Router } from "express";

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		interface Request {
			t: TFunction;
			language?: string;
		}
	}
}

const ASSET_FOLDER_PATH = path.join(__dirname, "..", "..", "..", "assets");

export async function initTranslation(router: Router) {
	const languages = fs.readdirSync(path.join(ASSET_FOLDER_PATH, "locales"));
	const namespaces = fs.readdirSync(
		path.join(ASSET_FOLDER_PATH, "locales", "en"),
	);
	const ns = namespaces
		.filter((x) => x.endsWith(".json"))
		.map((x) => x.slice(0, x.length - 5));

	await i18next.use(i18nextBackend).init({
		preload: languages,
		// debug: true,
		fallbackLng: "en",
		ns,
		backend: {
			loadPath:
				path.join(ASSET_FOLDER_PATH, "locales") +
				"/{{lng}}/{{ns}}.json",
		},
		load: "all",
	});

	router.use((req, res, next) => {
		let lng = "en";
		if (req.headers["accept-language"]) {
			lng = req.headers["accept-language"].split(",")[0];
		}
		req.language = lng;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		req.t = (key: string | string[], options?: any) => {
			return i18next.t(key, {
				...options,
				lng,
			});
		};
		next();
	});
}
