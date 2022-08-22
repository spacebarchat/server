import os from "os";
import { red } from "picocolors";

export function initStats() {
	
	console.log(`[Path] running in ${__dirname}`);
	try {
		console.log(`[CPU] ${os.cpus()[0].model} Cores x${os.cpus().length}`);
	}
	catch {
		console.log('[CPU] Failed to get cpu model!')
	}
	
	console.log(`[System] ${os.platform()} ${os.arch()}`);
	console.log(`[Process] running with PID: ${process.pid}`);
	if (process.getuid && process.getuid() === 0) {
		console.warn(
			red(
				`[Process] Warning fosscord is running as root, this highly discouraged and might expose your system vulnerable to attackers. Please run fosscord as a user without root privileges.`
			)
		);
	}

}
