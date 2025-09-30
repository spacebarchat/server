import { BaseEmailClient, IEmail } from "./IEmailClient";
import { Config } from "@spacebar/util*";

export class SendGridEmailClient extends BaseEmailClient {
	// sendGrid?: unknown;
	sendGrid?: typeof import("@sendgrid/mail");
	override async init(): Promise<void> {
		// get configuration
		const { apiKey } = Config.get().email.sendgrid;

		// ensure all required configuration values are set
		if (!apiKey)
			return console.error(
				"[Email] SendGrid has not been configured correctly.",
			);

		try {
			// try to import the transporter package
			this.sendGrid = (await import("@sendgrid/mail")).default;
		} catch {
			// if the package is not installed, log an error and return void so we don't set the transporter
			console.error(
				"[Email] SendGrid transport is not installed. Please run `npm install Maria-Golomb/nodemailer-sendgrid-transport --save-optional` to install it.",
			);
			return;
		}
		this.sendGrid.setApiKey(apiKey);
	}

	override async sendMail(email: IEmail): Promise<void> {
		if (!this.sendGrid) throw new Error("SendGrid not initialized");

		await this.sendGrid.send({
			to: email.to,
			from: email.from,
			subject: email.subject,
			text: email.text,
			html: email.html,
		});
	}
}