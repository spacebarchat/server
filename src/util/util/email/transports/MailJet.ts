import { Config } from "@fosscord/util";
import nodemailer from "nodemailer";

export default async function () {
	// get configuration
	const { apiKey, apiSecret } = Config.get().email.mailjet;

	// ensure all required configuration values are set
	if (!apiKey || !apiSecret)
		return console.error(
			"[Email] Mailjet has not been configured correctly.",
		);

	let mj;
	try {
		// try to import the transporter package
		mj = require("nodemailer-mailjet-transport");
	} catch {
		// if the package is not installed, log an error and return void so we don't set the transporter
		console.error(
			"[Email] Mailjet transport is not installed. Please run `npm install n0script22/nodemailer-mailjet-transport --save-optional` to install it.",
		);
		return;
	}

	// create the transporter configuration object
	const auth = {
		auth: {
			apiKey: apiKey,
			apiSecret: apiSecret,
		},
	};

	// create the transporter and return it
	return nodemailer.createTransport(mj(auth));
}
