import { BaseEmailClient, IEmail } from "./IEmailClient";
import { Config } from "@spacebar/util*";

export class SMTPEmailClient extends BaseEmailClient {
	// sendGrid?: unknown;
	nodemailer?: typeof import("nodemailer");
	transporter: import("nodemailer").Transporter;
	override async init(): Promise<void> {
		try {
			// try to import the transporter package
			this.nodemailer = (await import("nodemailer")).default;
		} catch {
			// if the package is not installed, log an error and return void so we don't set the transporter
			console.error("[Email] nodemailer is not installed. Please run `npm install nodemailer --save-optional` to install it.");
			return;
		}
		// get configuration
		const { host, port, secure, username, password } = Config.get().email.smtp;

		// ensure all required configuration values are set
		if (!host || !port || secure === null || !username || !password) return console.error("[Email] SMTP has not been configured correctly.");

		if (!Config.get().email.senderAddress && !Config.get().general.correspondenceEmail)
			return console.error(
				'[Email] You have to configure either "email_senderAddress" or "general_correspondenceEmail" for emails to work. The configured value is used as the sender address.',
			);

		// construct the transporter
		const transporter = this.nodemailer.createTransport({
			host,
			port,
			secure,
			auth: {
				user: username,
				pass: password,
			},
		});

		// verify connection configuration
		const verified = await transporter.verify().catch((err) => {
			console.error("[Email] SMTP verification failed:", err);
			return;
		});

		// if verification failed, return void and don't set transporter
		if (!verified) return;

		this.transporter = transporter;
	}

	override async sendMail(email: IEmail): Promise<void> {
		if (!this.nodemailer) throw new Error("nodemailer not initialized");
		if (!this.transporter) throw new Error("nodemailer transporter not initialized");

		await this.transporter.sendMail({
			to: email.to,
			from: email.from,
			subject: email.subject,
			text: email.text,
			html: email.html,
		});
	}
}
