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

import fs from "fs";
import path from "path";
import i18next from "i18next";
import i18nextMiddleware from "i18next-http-middleware";
import i18nextBackend from "i18next-fs-backend";
import { Router } from "express";

const ASSET_FOLDER_PATH = path.join(__dirname, "..", "..", "..", "assets");

export async function initTranslation(router: Router) {
	const languages = fs.readdirSync(path.join(ASSET_FOLDER_PATH, "locales"));
	const namespaces = fs.readdirSync(
		path.join(ASSET_FOLDER_PATH, "locales", "en"),
	);
	const ns = namespaces
		.filter((x) => x.endsWith(".json"))
		.map((x) => x.slice(0, x.length - 5));

	await i18next
		.use(i18nextBackend)
		.use(i18nextMiddleware.LanguageDetector)
		.init({
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

	router.use(i18nextMiddleware.handle(i18next, {}));
}
