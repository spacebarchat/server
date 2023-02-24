import { Config } from "@fosscord/util";
import nodemailer from "nodemailer";

export default async function () {
	// get configuration
	const { apiKey, domain } = Config.get().email.mailgun;

	// ensure all required configuration values are set
	if (!apiKey || !domain)
		return console.error(
			"[Email] Mailgun has not been configured correctly.",
		);

	let mg;
	try {
		// try to import the transporter package
		mg = require("nodemailer-mailgun-transport");
	} catch {
		// if the package is not installed, log an error and return void so we don't set the transporter
		console.error(
			"[Email] Mailgun transport is not installed. Please run `npm install nodemailer-mailgun-transport --save-optional` to install it.",
		);
		return;
	}

	// create the transporter configuration object
	const auth = {
		auth: {
			api_key: apiKey,
			domain: domain,
		},
	};

	// create the transporter and return it
	return nodemailer.createTransport(mg(auth));
}
