import os from "os";
import osu from "node-os-utils";
import { red } from "nanocolors";

export function initStats() {
	console.log(`[Path] running in ${__dirname}`);
	console.log(`[CPU] ${osu.cpu.model()} Cores x${osu.cpu.count()}`);
	console.log(`[System] ${os.platform()} ${os.arch()}`);
	console.log(`[Process] running with PID: ${process.pid}`);
	if (process.getuid && process.getuid() === 0) {
		console.warn(
			red(
				`[Process] Warning fosscord is running as root, this highly discouraged and might expose your system vulnerable to attackers. Please run fosscord as a user without root privileges.`
			)
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
