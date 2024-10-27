import { readFileSync } from "node:fs";
import fs from "fs";

var util = require("util");

// noinspection ES6ConvertRequireIntoImport
// const ioctl = require("ioctl");
// import ref from "ref";
// import ArrayType from "ref-array";
// import StructType from "ref-struct";
// import os from "os";

// const winsize = StructType({
// 	ws_row : ref.types.ushort,
// 	ws_col : ref.types.ushort,
// 	ws_xpixel : ref.types.ushort,
// 	ws_ypixel : ref.types.ushort
// });

// const originalConsoleLog = console.log;
// console.error =
// 	console.log =
// 	console.debug =
// 		function (message: object, ...optionalParams: object[]) {
// 			KittyLogo.printWithIcon(message + " " + optionalParams.join(" "));
// 		};

export class KittyLogo {
	public static printLogo(): void {
		const data = readFileSync(__dirname + "/../../../assets/logo.png", {
			encoding: "base64",
		});
		KittyLogo.writeImage({
			base64Data: data,
			width: 70,
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
		const data = readFileSync(__dirname + "/../../../assets/icon.png", {
			encoding: "base64",
		});
		KittyLogo.writeImage({
			base64Data: data,
			width: 2,
			addNewline: false,
		});
	}

	private static checkSupport(cb: void): boolean {
		process.stdin.setEncoding("utf8");
		process.stdin.setRawMode(true);
		let resp = "";
		process.stdin.once("data", function (key) {
			console.log(util.inspect(key));
			process.stdin.setRawMode(false);
			process.stdin.pause();
			resp = key.toString();
		});
		process.stdout.write(
			"\x1b_Gi=31,s=1,v=1,a=q,t=d,f=24;AAAA\x1b\\\x1b[c",
		);

		while(resp == "") {
			console.log("waiting");
			Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
		}

		return false;
	}

	// private static sleep(ms: number): void {
	// 	Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
	// }

	private static writeImage(request: KittyImageMetadata): void {
		if (this.checkSupport()) return;
		let pngData = request.base64Data;

		// Ga=T,q=2,o=z,s=1022,v=181,X=5;
		const chunkSize = 1024;

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

			process.stdout.write(
				header + `,m=${dataSize == chunkSize ? 1 : 0};`,
			);
			process.stdout.write(pngData.slice(0, chunkSize));
			pngData = pngData.slice(chunkSize);
			process.stdout.write("\x1b\\");
		}

		if (request.addNewline) process.stdout.write("\n");
	}
}

export class KittyImageMetadata {
	public base64Data: string;
	public width?: number;
	public height?: number;
	public widthPixels?: number;
	public heightPixels?: number;
	public addNewline?: boolean;
}

KittyLogo.printLogo();

//
// for (let i = 0; i < 10; i++) {
// 	KittyLogo.printLogo();
// }
// for (let i = 0; i < 10; i++) {
//
// 	console.log(" ".repeat(i)+"meow");
// }
