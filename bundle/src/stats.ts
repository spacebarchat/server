import os from "os";
import osu from "node-os-utils";

export function initStats() {
	console.log(`[CPU] ${osu.cpu.model()} Cores x${osu.cpu.count()}`);
	console.log(`[System] ${os.platform()} ${os.arch()}`);
	console.log(`[Database] started`);
	console.log(`[Process] running with pid: ${process.pid}`);

	setInterval(async () => {
		const [cpuUsed, memory, network] = await Promise.all([osu.cpu.usage(), osu.mem.info(), osu.netstat.inOut()]);
		if (typeof network === "object") {
			console.log(`[Network]: in ${network.total.inputMb}mb | out ${network.total.outputMb}mb`);
		}

		console.log(
			`[CPU] ${cpuUsed.toFixed(2)}% | [Memory] ${Math.round(
				process.memoryUsage().rss / 1024 / 1024
			)}mb/${memory.totalMemMb.toFixed(0)}mb`
		);
	}, 1000 * 60);
}
