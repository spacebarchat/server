const path = require("path");
const fetch = require("node-fetch");
const fs = require("fs/promises");
const { existsSync } = require("fs");

const CACHE_PATH = path.join(__dirname, "..", "assets", "cache");
const BASE_URL = "https://discord.com";

// Manual for now
const INDEX_SCRIPTS = [
	"83ace7450e110d16319e",	// 50
	"e02290aaa8dac5d195c2",	// 1
	"4f3b3c576b879a5f75d1",	// 0?
	"699456246fdfe7589855",	// ~4500.
];

const doPatch = (content) => {
	//remove nitro references
	content = content.replace(/Discord Nitro/g, "Fosscord Premium");
	content = content.replace(/"Nitro"/g, "\"Premium\"");
	content = content.replace(/Nitro /g, "Premium ");
	content = content.replace(/ Nitro/g, " Premium");
	content = content.replace(/\[Nitro\]/g, "[Premium]");
	content = content.replace(/\*Nitro\*/g, "*Premium*");
	content = content.replace(/\"Nitro \. /g, "\"Premium. ");

	//remove discord references
	content = content.replace(/ Discord /g, " Fosscord ");
	content = content.replace(/Discord /g, "Fosscord ");
	content = content.replace(/ Discord/g, " Fosscord");
	content = content.replace(/Discord Premium/g, "Fosscord Premium");
	content = content.replace(/Discord Nitro/g, "Fosscord Premium");
	content = content.replace(/Discord's/g, "Fosscord's");
	//content = content.replace(/DiscordTag/g, "FosscordTag");
	content = content.replace(/\*Discord\*/g, "*Fosscord*");

	//server -> guild
	content = content.replace(/"Server"/g, "\"Guild\"");
	content.replaceAll("server.\"", "guild.\"");
	content.replaceAll(" server ", " guild ");
	content.replaceAll(" Server ", " Guild ");
	content.replaceAll("\"Server", "\"Guild");

	// //change some vars
	// content = content.replace('dsn: "https://fa97a90475514c03a42f80cd36d147c4@sentry.io/140984"', "dsn: (/true/.test(localStorage.sentryOptIn)?'https://6bad92b0175d41a18a037a73d0cff282@sentry.thearcanebrony.net/12':'')");
	// content = content.replace('t.DSN = "https://fa97a90475514c03a42f80cd36d147c4@sentry.io/140984"', "t.DSN = (/true/.test(localStorage.sentryOptIn)?'https://6bad92b0175d41a18a037a73d0cff282@sentry.thearcanebrony.net/12':'')");
	// content = content.replace('--brand-experiment: hsl(235, calc(var(--saturation-factor, 1) * 85.6%), 64.7%);', '--brand-experiment: hsl(var(--brand-hue), calc(var(--saturation-factor, 1) * 85.6%), 50%);');
	// content = content.replaceAll(/--brand-experiment-(\d{1,4}): hsl\(235/g, '--brand-experiment-\$1: hsl(var(--brand-hue)');

	//logos
	// content = content.replace(/d: "M23\.0212.*/, `d: "${icons.get("homeIcon.path")!.toString()}"`);
	// content = content.replace('width: n, height: o, viewBox: "0 0 28 20"', 'width: 48, height: 48, viewBox: "0 0 48 48"');

	//save some time on load resolving asset urls...
	content = content.replaceAll('e.exports = n.p + "', 'e.exports = "/assets/');
	content = content.replaceAll('e.exports = r.p + "', 'e.exports = "/assets/');

	return content;
};

const processFile = async (name) => {
	const res = await fetch(`${BASE_URL}/assets/${name}.js`);
	let text = await res.text();

	text = doPatch(text);

	await fs.writeFile(path.join(CACHE_PATH, `${name}.js`), text);

	return [...new Set(text.match((/[A-Fa-f0-9]{20}/g)))];
};

(async () => {
	const start = Date.now();

	// console.log("Deleting previous cache");
	// await fs.rm(CACHE_PATH, { recursive: true });
	// await fs.mkdir(CACHE_PATH);

	const assets = [];

	while (INDEX_SCRIPTS.length > 0) {
		const asset = INDEX_SCRIPTS.shift();

		process.stdout.clearLine(0);
		process.stdout.cursorTo(0);
		process.stdout.write(`Scraping asset ${asset}. Remaining: ${INDEX_SCRIPTS.length}`);

		const newAssets = await processFile(asset);
		assets.push(...newAssets);
	}

	process.stdout.moveCursor(0, 1);

	let rates = [];
	let lastFinished = Date.now();
	let previousFinish = Date.now();

	for (var i = 0; i < assets.length; i++) {
		const asset = assets[i];

		if (existsSync(path.join(CACHE_PATH, `${asset}.js`))) {
			continue;
		}

		while (rates.length > 20) rates.shift();
		const averageRate = rates.length ? rates.reduce((prev, curr) => prev + curr) / rates.length : 1;
		const finishTime = (averageRate * (assets.length - i));

		process.stdout.clearLine(0);
		process.stdout.cursorTo(0);
		process.stdout.write(
			`Caching asset ${asset}. ` +
			`${i}/${assets.length - 1} = ${Math.floor((i / (assets.length - 1)) * 100)}% ` +
			`Finish at: ${new Date(Date.now() + finishTime).toLocaleTimeString()}`
		);

		await processFile(asset);

		lastFinished = Date.now();
		rates.push(lastFinished - previousFinish);
		previousFinish = lastFinished;
	}

	console.log(`\nDone`);
})();