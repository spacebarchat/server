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

import os from "os";
import osu from "node-os-utils";
import { readFileSync } from "node:fs";
import { red } from "picocolors";

export function initStats() {
	console.log(`[Path] Running in ${process.cwd()}`);
	console.log(`[Path] Running from ${__dirname}`);
	try {
		console.log(`[CPU] ${osu.cpu.model()} (x${osu.cpu.count()})`);
	} catch {
		console.log("[CPU] Failed to get CPU model!");
	}

	console.log(`[System] ${os.platform()} ${os.release()} ${os.arch()}`);
	if (os.platform() == "linux") {
		try {
			const osReleaseLines = readFileSync(
				"/etc/os-release",
				"utf8",
			).split("\n");
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-ignore
			const osRelease: any = {};
			for (const line of osReleaseLines) {
				if (!line) continue;
				const [key, value] = line.match(/(.*?)="?([^"]*)"?/)!.slice(1);
				osRelease[key] = value;
			}
			console.log(
				`[System]\x1b[${osRelease.ANSI_COLOR}m ${osRelease.NAME ?? "Unknown"} ${osRelease.VERSION ?? "Unknown"} (${osRelease.BUILD_ID ?? "No build ID"})\x1b[0m`,
			);
		} catch (e) {
			console.log(
				"[System] Unknown Linux distribution (missing /etc/os-release)",
			);
			console.log(e);
		}
	}
	console.log(`[Process] Running with PID: ${process.pid}`);
	if (process.getuid && process.getuid() === 0) {
		console.warn(
			red(
				`[Process] Warning Spacebar is running as root, this highly discouraged and might expose your system vulnerable to attackers.` +
					`Please run Spacebar as a user without root privileges.`,
			),
		);
	}

	// TODO: node-os-utils might have a memory leak, more investigation needed
	// TODO: doesn't work if spawned with multiple threads
	// setInterval(async () => {
	// 	const [cpuUsed, memory, network] = await Promise.all([
	// 		osu.cpu.usage(),
	// 		osu.mem.info(),
	// 		osu.netstat.inOut(),
	// 	]);
	// 	var networkUsage = "";
	// 	if (typeof network === "object") {
	// 		networkUsage = `| [Network]: in ${network.total.inputMb}mb | out ${network.total.outputMb}mb`;
	// 	}

	// 	console.log(
	// 		`[CPU] ${cpuUsed.toPrecision(3)}% | [Memory] ${Math.round(
	// 			process.memoryUsage().rss / 1024 / 1024
	// 		)}mb/${memory.totalMemMb.toFixed(0)}mb ${networkUsage}`
	// 	);
	// }, 1000 * 60 * 5);
}
