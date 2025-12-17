import { readFileSync } from "node:fs";
import { EnvConfig } from "../config";

// const originalConsoleLog = console.log;
// console.error =
// 	console.log =
// 	console.debug =
// 		function (message: object, ...optionalParams: object[]) {
// 			KittyLogo.printWithIcon(message + " " + optionalParams.join(" "));
// 		};

export class KittyLogo {
	static isSupported = false;
	private static iconCache: string;

	public static async initialise() {
		this.isSupported = await this.checkSupport();
		if (this.isSupported)
			this.iconCache = readFileSync(__dirname + "/../../../assets/icon.png", {
				encoding: "base64",
			});
	}

	public static printLogo(): void {
		const data = readFileSync(__dirname + "/../../../assets/logo.png", {
			encoding: "base64",
		});
		KittyLogo.writeImage({
			base64Data: data,
			width: 86,
			addNewline: true,
		});
	}

	public static printWithIcon(text?: string): void {
		if (text) {
			const lines = text.split("\n");
			for (const line of lines) {
				this.writeIcon();
				process.stdout.write(" " + line + "\n");
			}
		}
	}

	private static writeIcon(): void {
		KittyLogo.writeImage({
			base64Data: this.iconCache,
			width: 2,
			addNewline: false,
		});
	}

	private static checkSupport(): Promise<boolean> {
		if (EnvConfig.get().forceKiTTYLogo) return Promise.resolve(EnvConfig.get().forceKiTTYLogo === true);
		// Check if we are running in a terminal
		if (!process.stdin.isTTY) return Promise.resolve(false);
		if (!process.stdout.isTTY) return Promise.resolve(false);

		// Check if we are running in a Kitty terminal
		if (EnvConfig.get().terminalEmulator == "xterm-kitty") return Promise.resolve(true);

		// Check if we are running in a common unsupported terminal
		if (EnvConfig.get().terminalEmulator == "xterm") return Promise.resolve(false);
		if (EnvConfig.get().terminalEmulator == "xterm-256color") return Promise.resolve(false);

		return new Promise<boolean>((resolve) => {
			(async () => {
				process.stdin.setEncoding("utf8");
				process.stdin.setRawMode(true);
				let resp = "";
				process.stdin.once("data", function (key) {
					process.stdin.setRawMode(false);
					process.stdin.pause();
					resp = key.toString();
					if (resp.startsWith("\x1B_Gi=31;OK")) resolve(true);
					else resolve(false);
				});
				process.stdout.write("\x1b_Gi=31,s=1,v=1,a=q,t=d,f=24;AAAA\x1b\\\x1b[c");

				await new Promise((res) => setTimeout(res, 5000));
				resolve(false);
			})();
		});
	}

	private static writeImage(request: KittyImageMetadata) {
		if (!this.isSupported) return;
		let pngData = request.base64Data;

		// Ga=T,q=2,o=z,s=1022,v=181,X=5;
		const chunkSize = 4096;

		//#region Header
		let header = `\x1b_G`; // enable graphics
		header += "a=T"; // action = transmit & display
		header += ",q=2"; // suppress response
		header += ",f=100"; // image format = png
		header += ",t=d"; // transmission = direct
		header += ",x=0"; // current x position
		header += ",y=0"; // current y position
		if (request.width) header += `,c=${request.width}`; // width (columns)
		if (request.height) header += `,r=${request.height}`; // height (rows)
		if (request.widthPixels) header += `,w=${request.widthPixels}`; // width (pixels)
		if (request.heightPixels) header += `,h=${request.heightPixels}`; // height (pixels)
		//#endregion

		while (pngData.length > 0) {
			const dataSize = Math.min(pngData.length, chunkSize);

			process.stdout.write(header + `,m=${dataSize == chunkSize ? 1 : 0};`);
			process.stdout.write(pngData.slice(0, chunkSize));
			pngData = pngData.slice(chunkSize);
			process.stdout.write("\x1b\\");
		}

		if (request.addNewline) process.stdout.write("\n");
	}
}

export interface KittyImageMetadata {
	base64Data: string;
	width?: number;
	height?: number;
	widthPixels?: number;
	heightPixels?: number;
	addNewline?: boolean;
}
