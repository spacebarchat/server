import { BaseEmailClient, IEmail } from "./IEmailClient";
import { Config } from "@spacebar/util*";

// NOTE: mailgun supports SMTP, is there any point in maintaining this?
export class MailGunEmailClient extends BaseEmailClient {
	mailGun?: unknown;
	mailGunClient?: unknown;
	// mailGun?: import("mailgun.js").default; // for development - doesn't work if package isn't installed
	// mailGunClient?: import("mailgun.js/Classes/MailgunClient").default; // for development - doesn't work if package isn't installed
	override async init(): Promise<void> {
		// get configuration
		const { apiKey, username, domain, isEuropean } = Config.get().email.mailgun;

		// ensure all required configuration values are set
		if (!apiKey || !domain || !username) return console.error("[Email] Mailgun has not been configured correctly.");

		try {
			// try to import the transporter package
			this.mailGun = new (await import("mailgun.js")).default(FormData);
		} catch {
			// if the package is not installed, log an error and return void so we don't set the transporter
			console.error("[Email] MailGun transport is not installed. Please run `npm install mailgun.js --save-optional` to install it.");
			return;
		}

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		this.mailGun.client({ username: username, key: apiKey, url: isEuropean ? "https://api.eu.mailgun.net" : undefined });
	}

	override async sendMail(email: IEmail): Promise<void> {
		if (!this.mailGun) throw new Error("MailGun not initialized");
		if (!this.mailGunClient) throw new Error("MailGun not initialized");
		const { domain } = Config.get().email.mailgun;
		if (!domain) throw new Error("MailGun domain not configured");

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		await this.mailGunClient.messages.create(domain, {
			to: email.to,
			from: email.from,
			subject: email.subject,
			text: email.text,
			html: email.html,
		});
	}
}
