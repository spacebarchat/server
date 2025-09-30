import { BaseEmailClient, IEmail } from "./IEmailClient";
import { Config } from "@spacebar/util*";

export class MailJetEmailClient extends BaseEmailClient {
	mailJet?: unknown;
	// mailJet?: import("node-mailjet").default; // for development - doesn't work if package isn't installed
	override async init(): Promise<void> {
		// get configuration
		const { apiKey, apiSecret } = Config.get().email.mailjet;

		// ensure all required configuration values are set
		if (!apiKey || !apiSecret) return console.error("[Email] Mailjet has not been configured correctly.");

		try {
			// try to import the transporter package
			this.mailJet = new (await import("node-mailjet")).default({
				apiKey: apiKey,
				apiSecret: apiSecret,
			});
		} catch {
			// if the package is not installed, log an error and return void so we don't set the transporter
			console.error("[Email] MailJet transport is not installed. Please run `npm install node-mailjet --save-optional` to install it.");
			return;
		}
	}

	override async sendMail(email: IEmail): Promise<void> {
		if (!this.mailJet) throw new Error("mailJet not initialized");

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		await this.mailJet.post("send", { version: "v3.1" }).request({
			Messages: [
				{
					From: {
						Email: Config.get().email.senderAddress,
						Name: Config.get().general.instanceName,
					},
					To: [
						{
							Email: email.to,
						},
					],
					Subject: email.subject,
					TextPart: email.text,
					HTMLPart: email.html,
				},
			],
		});
	}
}
