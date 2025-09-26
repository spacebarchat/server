import { KittyLogo } from ".";
import { blueBright } from "picocolors";

export class Logo {
	public static async printLogo() {
		await KittyLogo.initialise();
		if (KittyLogo.isSupported) KittyLogo.printLogo();
		else console.log(this.AsciiLogo);
	}

	private static AsciiLogo = blueBright(
		`
  ████      ████     ███████╗██████╗  █████╗  ██████╗███████╗██████╗  █████╗ ██████╗ 
 ███████  ███████    ██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗██╔══██╗██╔══██╗
 ████████████████    ███████╗██████╔╝███████║██║     █████╗  ██████╔╝███████║██████╔╝
█████   ██   █████   ╚════██║██╔═══╝ ██╔══██║██║     ██╔══╝  ██╔══██╗██╔══██║██╔══██╗
██████████████████   ███████║██║     ██║  ██║╚██████╗███████╗██████╔╝██║  ██║██║  ██║
 ████████████████    ╚══════╝╚═╝     ╚═╝  ╚═╝ ╚═════╝╚══════╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝`.substring(1),
	);
}
