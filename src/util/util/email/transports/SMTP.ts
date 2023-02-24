import { Config } from "@fosscord/util";
import nodemailer from "nodemailer";

export default async function () {
	// get configuration
	const { host, port, secure, username, password } = Config.get().email.smtp;

	// ensure all required configuration values are set
	if (!host || !port || secure === null || !username || !password)
		return console.error("[Email] SMTP has not been configured correctly.");

	if (!Config.get().general.correspondenceEmail)
		return console.error(
			"[Email] Correspondence email has not been configured! This is used as the sender email address.",
		);

	// construct the transporter
	const transporter = nodemailer.createTransport({
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

	return transporter;
}
