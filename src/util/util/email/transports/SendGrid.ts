import { Config } from "@fosscord/util";
import nodemailer from "nodemailer";

export default async function () {
	// get configuration
	const { apiKey } = Config.get().email.sendgrid;

	// ensure all required configuration values are set
	if (!apiKey)
		return console.error(
			"[Email] SendGrid has not been configured correctly.",
		);

	let sg;
	try {
		// try to import the transporter package
		sg = require("nodemailer-sendgrid-transport");
	} catch {
		// if the package is not installed, log an error and return void so we don't set the transporter
		console.error(
			"[Email] SendGrid transport is not installed. Please run `npm install Maria-Golomb/nodemailer-sendgrid-transport --save-optional` to install it.",
		);
		return;
	}

	// create the transporter configuration object
	const auth = {
		auth: {
			api_key: apiKey,
		},
	};

	// create the transporter and return it
	return nodemailer.createTransport(sg(auth));
}
