const path = require("path");
const fetch = require("node-fetch");
const http = require('http');
const https = require('https');
const fs = require("fs/promises");
const { existsSync } = require("fs");

// https://stackoverflow.com/a/62500224
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });
const agent = (_parsedURL) => _parsedURL.protocol == 'http:' ? httpAgent : httpsAgent;

const CACHE_PATH = path.join(__dirname, "..", "assets", "cache");
const BASE_URL = "https://discord.com";

const INSTANCE_NAME = "Slowcord";

// Manual for now
const INDEX_SCRIPTS = [
	"83ace7450e110d16319e", // 50
	"e02290aaa8dac5d195c2", // 1
	"4f3b3c576b879a5f75d1", // 0?
	"699456246fdfe7589855", // ~4500.
];

const doPatch = (content) => {
	//remove nitro references
	content = content.replaceAll(/Discord Nitro/g, `${INSTANCE_NAME} Premium`);
	content = content.replaceAll(/"Nitro"/g, '"Premium"');
	content = content.replaceAll(/Nitro /g, "Premium ");
	content = content.replaceAll(/ Nitro/g, " Premium");
	content = content.replaceAll(/\[Nitro\]/g, "[Premium]");
	content = content.replaceAll(/\*Nitro\*/g, "*Premium*");
	content = content.replaceAll(/\"Nitro \. /g, '"Premium. ');

	//remove discord references
	content = content.replaceAll(/ Discord /g, ` ${INSTANCE_NAME} `);
	content = content.replaceAll(/Discord /g, `${INSTANCE_NAME} `);
	content = content.replaceAll(/ Discord/g, ` ${INSTANCE_NAME}`);
	content = content.replaceAll(/Discord Premium/g, `${INSTANCE_NAME} Premium`);
	content = content.replaceAll(/Discord Nitro/g, `${INSTANCE_NAME} Premium`);
	content = content.replaceAll(/Discord's/g, `${INSTANCE_NAME}'s`);
	//content = content.replaceAll(/DiscordTag/g, "FosscordTag");
	content = content.replaceAll(/\*Discord\*/g, `*${INSTANCE_NAME}*`);

	//server -> guild
	const serverVariations = [
		['"Server"', '"Guild"'],
		['"Server ', '"Guild '],
		[' Server"', ' Guild"'],
		[' Server ', ' Guild '],

		['"Server."', '"Guild."'],
		[' Server."', ' Guild."'],

		['"Server."', '"Guild,"'],
		[' Server,"', ' Guild,"'],
		[' Server,', ' Guild,'],

		['"Servers"', '"Guilds"'],
		['"Servers ', '"Guilds '],
		[' Servers"', ' Guilds"'],
		[' Servers ', ' Guilds '],

		['"Servers."', '"Guilds."'],
		[' Servers."', ' Guilds,"'],

		['"Servers,"', '"Guilds,"'],
		[' Servers,"', ' Guilds,"'],
		[' Servers,', ' Guilds,'],
	];
	serverVariations.forEach(x => serverVariations.push([x[0].toLowerCase(), x[1].toLowerCase()]));
	serverVariations.forEach(x => content = content.replaceAll(x[0], x[1]));
	// can't match \nServers for some reason
	content = content.replaceAll('Servers in the Hub are student-run, but may include non-students."', 'Guilds in the Hub are student-run, but may include non-students."');

	// sentry
	content = content.replaceAll("https://fa97a90475514c03a42f80cd36d147c4@sentry.io/140984", "https://05e8e3d005f34b7d97e920ae5870a5e5@sentry.thearcanebrony.net/6");

	//logos
	content = content.replaceAll(
		"M23.0212 1.67671C21.3107 0.879656 19.5079 0.318797 17.6584 0C17.4062 0.461742 17.1749 0.934541 16.9708 1.4184C15.003 1.12145 12.9974 1.12145 11.0283 1.4184C10.819 0.934541 10.589 0.461744 10.3368 0.00546311C8.48074 0.324393 6.67795 0.885118 4.96746 1.68231C1.56727 6.77853 0.649666 11.7538 1.11108 16.652C3.10102 18.1418 5.3262 19.2743 7.69177 20C8.22338 19.2743 8.69519 18.4993 9.09812 17.691C8.32996 17.3997 7.58522 17.0424 6.87684 16.6135C7.06531 16.4762 7.24726 16.3387 7.42403 16.1847C11.5911 18.1749 16.408 18.1749 20.5763 16.1847C20.7531 16.3332 20.9351 16.4762 21.1171 16.6135C20.41 17.0369 19.6639 17.3997 18.897 17.691C19.3052 18.4993 19.7718 19.2689 20.3021 19.9945C22.6677 19.2689 24.8929 18.1364 26.8828 16.6466H26.8893C27.43 10.9731 25.9665 6.04728 23.0212 1.67671ZM9.68041 13.6383C8.39754 13.6383 7.34085 12.4453 7.34085 10.994C7.34085 9.54272 8.37155 8.34973 9.68041 8.34973C10.9893 8.34973 12.0395 9.54272 12.0187 10.994C12.0187 12.4453 10.9828 13.6383 9.68041 13.6383ZM18.3161 13.6383C17.0332 13.6383 15.9765 12.4453 15.9765 10.994C15.9765 9.54272 17.0124 8.34973 18.3161 8.34973C19.6184 8.34973 20.6751 9.54272 20.6543 10.994C20.6543 12.4453 19.6184 13.6383 18.3161 13.6383Z",
		"M 0,0 47.999993,2.7036528e-4 C 48.001796,3.3028172 47.663993,6.5968018 46.991821,9.8301938 43.116101,28.454191 28.452575,43.116441 9.8293509,46.992163 6.5960834,47.664163 3.3023222,48.001868 0,47.999992 Z m 9.8293509,28.735114 v 9.248482 C 22.673599,33.047696 32.857154,22.749268 37.63852,9.829938 H 9.8293509 v 8.679899 H 22.931288 c -3.554489,3.93617 -7.735383,7.257633 -12.373436,9.829938 -0.241031,0.133684 -0.483864,0.265492 -0.7285011,0.395339 z"
	);
	content = content.replaceAll('width:n,height:o,viewBox:"0 0 28 20"', 'width:48,height:48,viewBox:"0 0 48 48"');

	//save some time on load resolving asset urls...
	content = content.replaceAll(
		'e.exports = n.p + "',
		'e.exports = "/assets/',
	);
	content = content.replaceAll(
		'e.exports = r.p + "',
		'e.exports = "/assets/',
	);

	// app download links
	content = content.replaceAll(
		"https://play.google.com/store/apps/details?id=com.discord",
		"https://slowcord.understars.dev/api/download?platform=android",
	);

	content = content.replaceAll(
		"https://itunes.apple.com/app/discord/id985746746",
		"https://slowcord.understars.dev/api/download?platform=ios"
	);

	// TODO change public test build link
	// content = content.replaceAll(
	// 	"https://discord.com/download#ptb-card",
	//	""
	// )

	content = content.replaceAll("status.discord.com", "status.understars.dev");

	content = content.replaceAll(
		"delete window.localStorage",
		"console.log('Prevented deletion of localStorage')"
	);

	return content;
};

const processFile = async (name) => {
	const res = await fetch(`${BASE_URL}/assets/${name}${name.includes(".") ? "" : ".js"}`, {
		agent,
	});
	if (res.status !== 200) {
		return [];
	};

	if (name.includes(".") && !name.includes(".js") && !name.includes(".css")) {
		await fs.writeFile(path.join(CACHE_PATH, name), await res.buffer());
		return [];
	}

	let text = await res.text();

	text = doPatch(text);

	await fs.writeFile(path.join(CACHE_PATH, `${name}${name.includes(".") ? "" : ".js"}`), text);

	return [...new Set(text.match(/\"[A-Fa-f0-9]{20}\"/g))].map(x => x.replaceAll("\"", ""));
};

(async () => {
	const start = Date.now();

	// console.log("Deleting previous cache");
	// await fs.rm(CACHE_PATH, { recursive: true });
	if (!existsSync(CACHE_PATH)) await fs.mkdir(CACHE_PATH);

	const assets = [];

	while (INDEX_SCRIPTS.length > 0) {
		const asset = INDEX_SCRIPTS.shift();

		process.stdout.clearLine(0);
		process.stdout.cursorTo(0);
		process.stdout.write(
			`Scraping asset ${asset}. Remaining: ${INDEX_SCRIPTS.length}`,
		);

		const newAssets = await processFile(asset);
		assets.push(...newAssets);
	}

	process.stdout.moveCursor(0, 1);

	const CACHE_MISSES = (await fs.readFile(path.join(CACHE_PATH, "..", "cacheMisses"))).toString().split("\n");
	while (CACHE_MISSES.length > 0) {
		const asset = CACHE_MISSES.shift();
		process.stdout.clearLine(0);
		process.stdout.cursorTo(0);
		process.stdout.write(
			`Scraping cache misses ${asset}. Remaining: ${CACHE_MISSES.length}`,
		);

		if (existsSync(path.join(CACHE_PATH, `${asset}`))) {
			continue;
		}

		const newAssets = await processFile(asset);
		assets.push(...newAssets);
	}

	process.stdout.moveCursor(0, 1);

	var existing = await fs.readdir(CACHE_PATH);
	while (existing.length > 0) {
		var file = existing.shift();

		process.stdout.clearLine(0);
		process.stdout.cursorTo(0);
		process.stdout.write(
			`Patching existing ${file}. Remaining: ${existing.length}.`,
		);

		var text = (await fs.readFile(path.join(CACHE_PATH, file)));
		if (file.includes(".js") || file.includes(".css")) {
			text = doPatch(text.toString());
			await fs.writeFile(path.join(CACHE_PATH, file), text.toString());
			assets.push(...[...new Set(text.match(/\"[A-Fa-f0-9]{20}\"/g))].map(x => x.replaceAll("\"", "")));
		}
	}

	process.stdout.moveCursor(0, 1);

	let rates = [];
	let lastFinished = Date.now();
	let previousFinish = Date.now();

	let promises = [];

	for (var i = 0; i < assets.length; i++) {
		const asset = assets[i];

		if (existsSync(path.join(CACHE_PATH, `${asset}.js`))) {
			continue;
		}

		while (rates.length > 50) rates.shift();
		const averageRate = rates.length
			? rates.reduce((prev, curr) => prev + curr) / rates.length
			: 1;
		const finishTime = averageRate * (assets.length - i);

		process.stdout.clearLine(0);
		process.stdout.cursorTo(0);
		process.stdout.write(
			`Caching asset ${asset}. ` +
			`${i}/${assets.length - 1} = ${Math.floor(
				(i / (assets.length - 1)) * 100,
			)}% `
			// + `Finish at: ${new Date(
			// 	Date.now() + finishTime,
			// ).toLocaleTimeString()}`,
		);

		promises.push(processFile(asset));
		// await processFile(asset);

		if (promises.length > 100) {
			const values = await Promise.all(promises);
			assets.push(...values.flat());
			promises = [];
			lastFinished = Date.now();
			rates.push(lastFinished - previousFinish);
			previousFinish = lastFinished;
		}
	}

	console.log(`\nDone`);
})();
