import "missing-native-js-functions";
import fetch from "node-fetch";
import ProxyAgent from 'proxy-agent';
import readline from "readline";
import fs from "fs/promises";
import path from "path";

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

export function enableAutoUpdate(opts: {
	checkInterval: number | boolean;
	packageJsonLink: string;
	path: string;
	downloadUrl: string;
	downloadType?: "zip";
}) {
	if (!opts.checkInterval) return;
	var interval = 1000 * 60 * 60 * 24;
	if (typeof opts.checkInterval === "number") opts.checkInterval = 1000 * interval;

	const i = setInterval(async () => {
		const currentVersion = await getCurrentVersion(opts.path);
		const latestVersion = await getLatestVersion(opts.packageJsonLink);
		if (currentVersion !== latestVersion) {
			clearInterval(i);
			console.log(`[Auto Update] Current version (${currentVersion}) is out of date, updating ...`);
			await download(opts.downloadUrl, opts.path);
		}
	}, interval);
	setImmediate(async () => {
		const currentVersion = await getCurrentVersion(opts.path);
		const latestVersion = await getLatestVersion(opts.packageJsonLink);
		if (currentVersion !== latestVersion) {
			rl.question(
				`[Auto Update] Current version (${currentVersion}) is out of date, would you like to update? (yes/no)`,
				(answer) => {
					if (answer.toBoolean()) {
						console.log(`[Auto update] updating ...`);
						download(opts.downloadUrl, opts.path);
					} else {
						console.log(`[Auto update] aborted`);
					}
				}
			);
		}
	});
}

async function download(url: string, dir: string) {
	try {
		// TODO: use file stream instead of buffer (to prevent crash because of high memory usage for big files)
		// TODO check file hash
		const agent = new ProxyAgent();
		const response = await fetch(url, { agent });
		const buffer = await response.buffer();
		const tempDir = await fs.mkdtemp("fosscord");
		fs.writeFile(path.join(tempDir, "Fosscord.zip"), buffer);
	} catch (error) {
		console.error(`[Auto Update] download failed`, error);
	}
}

async function getCurrentVersion(dir: string) {
	try {
		const content = await fs.readFile(path.join(dir, "package.json"), { encoding: "utf8" });
		return JSON.parse(content).version;
	} catch (error) {
		throw new Error("[Auto update] couldn't get current version in " + dir);
	}
}

async function getLatestVersion(url: string) {
	try {
		const agent = new ProxyAgent();
		const response = await fetch(url, { agent });
		const content = await response.json();
		return content.version;
	} catch (error) {
		throw new Error("[Auto update] check failed for " + url);
	}
}
