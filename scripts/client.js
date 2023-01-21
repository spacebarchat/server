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

/*
	This file downloads a complete discord.com web client for testing,
	and performs some basic patching:
	* Replaces all mentions of "Server" -> "Guild"
	* Replaces "Discord" -> `INSTANCE_NAME` variable
	* "Nitro" -> "Premium"
	* Prevents `localStorage` deletion ( for `plugins`/`preload-plugins` )
	* Adds `fast-identify` support ( TODO: add documentation )

	TODO: Make this configurable easily.
*/

/*eslint-env node*/

require("dotenv/config");
const path = require("path");
const fetch = require("node-fetch");
const http = require("http");
const https = require("https");
const fs = require("fs/promises");
const { existsSync } = require("fs");

// https://stackoverflow.com/a/62500224
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });
const agent = (_parsedURL) =>
	_parsedURL.protocol == "http:" ? httpAgent : httpsAgent;

const CACHE_PATH = path.join(__dirname, "..", "assets", "cache");
const BASE_URL = "https://discord.com";

const INSTANCE_NAME = process.env.CLIENT_PATCH_INSTANCE_NAME ?? "Fosscord";
const ONLY_CACHE_JS = process.env.ONLY_CACHE_JS ? true : false;

// Manual for now
const INDEX_SCRIPTS = [
	"b456855ec667950dcf68", // 50
	"cfb9efe961b2bf3647bc", // 1
	"f98a039261c37f892cbf", // 0?
	"4470c87bb13810847db0", // ~4500.

	// also fetch other assets from index, as we don't have a way to dl old indexes
	"40532.f4ff6c4a39fa78f07880.css",
	"b21a783b953e52485dcb.worker.js",
	"2bbea887c6d07e427a1d.worker.js",
	"0ec5df6d78ff7a5cc7c8.worker.js",
	"625ccb6efce655a7d928.worker.js",
	"05422eb499ddf5616e44a52c4f1063ae.woff2",
	"77f603cc7860fcb784e6ef9320a4a9c2.woff2",
	"e689380400b1f2d2c6320a823a1ab079.svg",
];

const doPatch = (content) => {
	//remove nitro references
	content = content.replaceAll(/Discord Nitro/g, `${INSTANCE_NAME} Premium`);
	content = content.replaceAll(/"Nitro"/g, '"Premium"');
	content = content.replaceAll(/Nitro /g, "Premium ");
	content = content.replaceAll(/ Nitro/g, " Premium");
	content = content.replaceAll(/\[Nitro\]/g, "[Premium]");
	content = content.replaceAll(/\*Nitro\*/g, "*Premium*");
	content = content.replaceAll(/"Nitro \. /g, '"Premium. ');

	//remove discord references
	content = content.replaceAll(/ Discord /g, ` ${INSTANCE_NAME} `);
	content = content.replaceAll(/Discord /g, `${INSTANCE_NAME} `);
	content = content.replaceAll(/ Discord/g, ` ${INSTANCE_NAME}`);
	content = content.replaceAll(
		/Discord Premium/g,
		`${INSTANCE_NAME} Premium`,
	);
	content = content.replaceAll(/Discord Nitro/g, `${INSTANCE_NAME} Premium`);
	content = content.replaceAll(/Discord's/g, `${INSTANCE_NAME}'s`);
	//content = content.replaceAll(/DiscordTag/g, "FosscordTag");
	content = content.replaceAll(/\*Discord\*/g, `*${INSTANCE_NAME}*`);

	// Replace window title
	content = content.replaceAll(
		":c.base;",
		`:(c.base == 'Discord' ? '${INSTANCE_NAME}' : c.base);`,
	);

	//server -> guild
	const serverVariations = [
		['"Server"', '"Guild"'],
		['"Server ', '"Guild '],
		[' Server"', ' Guild"'],
		[" Server ", " Guild "],

		['"Server."', '"Guild."'],
		[' Server."', ' Guild."'],

		['"Server."', '"Guild,"'],
		[' Server,"', ' Guild,"'],
		[" Server,", " Guild,"],

		['"Servers"', '"Guilds"'],
		['"Servers ', '"Guilds '],
		[' Servers"', ' Guilds"'],
		[" Servers ", " Guilds "],

		['"Servers."', '"Guilds."'],
		[' Servers."', ' Guilds,"'],

		['"Servers,"', '"Guilds,"'],
		[' Servers,"', ' Guilds,"'],
		[" Servers,", " Guilds,"],

		["\nServers", "\nGuilds"],
	];
	serverVariations.forEach((x) =>
		serverVariations.push([x[0].toLowerCase(), x[1].toLowerCase()]),
	);
	serverVariations.forEach((x) => (content = content.replaceAll(x[0], x[1])));

	// sentry
	content = content.replaceAll(
		"https://fa97a90475514c03a42f80cd36d147c4@sentry.io/140984",
		"https://05e8e3d005f34b7d97e920ae5870a5e5@sentry.thearcanebrony.net/6",
	);

	//logos
	content = content.replaceAll(
		"M23.0212 1.67671C21.3107 0.879656 19.5079 0.318797 17.6584 0C17.4062 0.461742 17.1749 0.934541 16.9708 1.4184C15.003 1.12145 12.9974 1.12145 11.0283 1.4184C10.819 0.934541 10.589 0.461744 10.3368 0.00546311C8.48074 0.324393 6.67795 0.885118 4.96746 1.68231C1.56727 6.77853 0.649666 11.7538 1.11108 16.652C3.10102 18.1418 5.3262 19.2743 7.69177 20C8.22338 19.2743 8.69519 18.4993 9.09812 17.691C8.32996 17.3997 7.58522 17.0424 6.87684 16.6135C7.06531 16.4762 7.24726 16.3387 7.42403 16.1847C11.5911 18.1749 16.408 18.1749 20.5763 16.1847C20.7531 16.3332 20.9351 16.4762 21.1171 16.6135C20.41 17.0369 19.6639 17.3997 18.897 17.691C19.3052 18.4993 19.7718 19.2689 20.3021 19.9945C22.6677 19.2689 24.8929 18.1364 26.8828 16.6466H26.8893C27.43 10.9731 25.9665 6.04728 23.0212 1.67671ZM9.68041 13.6383C8.39754 13.6383 7.34085 12.4453 7.34085 10.994C7.34085 9.54272 8.37155 8.34973 9.68041 8.34973C10.9893 8.34973 12.0395 9.54272 12.0187 10.994C12.0187 12.4453 10.9828 13.6383 9.68041 13.6383ZM18.3161 13.6383C17.0332 13.6383 15.9765 12.4453 15.9765 10.994C15.9765 9.54272 17.0124 8.34973 18.3161 8.34973C19.6184 8.34973 20.6751 9.54272 20.6543 10.994C20.6543 12.4453 19.6184 13.6383 18.3161 13.6383Z",
		"M 0,0 47.999993,2.7036528e-4 C 48.001796,3.3028172 47.663993,6.5968018 46.991821,9.8301938 43.116101,28.454191 28.452575,43.116441 9.8293509,46.992163 6.5960834,47.664163 3.3023222,48.001868 0,47.999992 Z m 9.8293509,28.735114 v 9.248482 C 22.673599,33.047696 32.857154,22.749268 37.63852,9.829938 H 9.8293509 v 8.679899 H 22.931288 c -3.554489,3.93617 -7.735383,7.257633 -12.373436,9.829938 -0.241031,0.133684 -0.483864,0.265492 -0.7285011,0.395339 z",
	);
	content = content.replaceAll(
		'width:n,height:c,viewBox:"0 0 28 20"',
		'width:50,height:50,viewBox:"0 0 50 50"',
	);

	// app download links
	// content = content.replaceAll(
	// 	"https://play.google.com/store/apps/details?id=com.discord",
	// 	"https://slowcord.understars.dev/api/download?platform=android",
	// );

	// content = content.replaceAll(
	// 	"https://itunes.apple.com/app/discord/id985746746",
	// 	"https://slowcord.understars.dev/api/download?platform=ios"
	// );

	// TODO change public test build link
	// content = content.replaceAll(
	// 	"https://discord.com/download#ptb-card",
	//	""
	// )

	// TODO: Easy config for this
	// content = content.replaceAll("status.discord.com", "status.understars.dev");
	// content = content.replaceAll("discordstatus.com", "status.understars.dev");

	// Stop client from deleting `localStorage` global. Makes `plugins` and `preload-plugins` less annoying.
	content = content.replaceAll(
		"delete window.localStorage",
		"console.log('Prevented deletion of localStorage')",
	);

	// fast identify
	content = content.replaceAll(
		"e.isFastConnect=t;t?e._doFastConnectIdentify():e._doResumeOrIdentify()",
		"e.isFastConnect=t; if (t !== undefined) e._doResumeOrIdentify();",
	);

	// disable qr code login
	content = content.replaceAll(
		/\w\?\(\d,\w\.jsx\)\(\w*,{authTokenCallback:this\.handleAuthToken}\):null/g,
		"null",
	);

	return content;
};

const print = (x, printover = true) => {
	var repeat = process.stdout.columns - x.length;
	process.stdout.write(
		`${x}${" ".repeat(Math.max(0, repeat))}${printover ? "\r" : "\n"}`,
	);
};

const processFile = async (asset) => {
	// The asset name may not include the file extension. Usually if it doesn't, it's js though.
	asset = `${asset}${asset.includes(".") ? "" : ".js"}`;
	if (ONLY_CACHE_JS && !asset.endsWith(".js")) return [];

	const url = `${BASE_URL}/assets/${asset}`;
	const res = await fetch(url, { agent });
	if (res.status !== 200) {
		print(`${res.status} on ${asset}`, false);
		return [];
	}

	if (
		asset.includes(".") &&
		!asset.includes(".js") &&
		!asset.includes(".css")
	) {
		await fs.writeFile(path.join(CACHE_PATH, asset), await res.buffer());
		return [];
	}

	let text = await res.text();
	text = doPatch(text);

	await fs.writeFile(path.join(CACHE_PATH, asset), text);

	let ret = new Set([
		...(text.match(/"[A-Fa-f0-9]{20}"/g) ?? []), // These are generally JS assets
		...[...text.matchAll(/\.exports=.\..\+"(.*?\..{0,5})"/g)].map(
			(x) => x[1],
		), // anything that looks like e.exports="filename.ext"
		...[...text.matchAll(/\/assets\/(.*?\.[a-z]{0,5})/g)].map((x) => x[1]), // commonly matches `background: url(/assets/blah.svg)`
	]);

	return [...ret].map((x) => x.replaceAll('"', ""));
};

(async () => {
	if (!existsSync(CACHE_PATH))
		await fs.mkdir(CACHE_PATH, { recursive: true });

	// Use a set to remove dupes for us
	const assets = new Set(INDEX_SCRIPTS);
	let promises = [];

	let index = 0;
	for (let asset of assets) {
		index += 1;
		print(`Scraping asset ${asset}. Remaining: ${assets.size - index}`);

		promises.push(processFile(asset));
		if (promises.length > 100 || index == assets.size) {
			const values = await Promise.all(promises);
			promises = [];
			values.flat().forEach((x) => assets.add(x));
		}
	}

	console.log("done");
})();
