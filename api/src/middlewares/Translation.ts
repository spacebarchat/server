import fs from "fs";
import path from "path";
import i18next from "i18next";
import i18nextMiddleware from "i18next-http-middleware";
import i18nextBackend from "i18next-node-fs-backend";
import { Router } from "express";

export async function initTranslation(router: Router) {
	const languages = fs.readdirSync(path.join(__dirname, "..", "..", "locales"));
	const namespaces = fs.readdirSync(path.join(__dirname, "..", "..", "locales", "en"));
	const ns = namespaces.filter((x) => x.endsWith(".json")).map((x) => x.slice(0, x.length - 5));

	await i18next
		.use(i18nextBackend)
		.use(i18nextMiddleware.LanguageDetector)
		.init({
			preload: languages,
			// debug: true,
			fallbackLng: "en",
			ns,
			backend: {
				loadPath: __dirname + "/../../locales/{{lng}}/{{ns}}.json"
			},
			load: "all"
		});

	router.use(i18nextMiddleware.handle(i18next, {}));
}
