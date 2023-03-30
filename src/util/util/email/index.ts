/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import fs from "node:fs";
import path from "node:path";
import { SentMessageInfo, Transporter } from "nodemailer";
import { User } from "../../entities";
import { Config } from "../Config";
import { generateToken } from "../Token";
import MailGun from "./transports/MailGun";
import MailJet from "./transports/MailJet";
import SendGrid from "./transports/SendGrid";
import SMTP from "./transports/SMTP";

const ASSET_FOLDER_PATH = path.join(
	__dirname,
	"..",
	"..",
	"..",
	"..",
	"assets",
);
export const EMAIL_REGEX =
	/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function adjustEmail(email?: string): string | undefined {
	if (!email) return email;
	// body parser already checked if it is a valid email
	const parts = <RegExpMatchArray>email.match(EMAIL_REGEX);
	if (!parts || parts.length < 5) return undefined;

	return email;
	// // TODO: The below code doesn't actually do anything.
	// const domain = parts[5];
	// const user = parts[1];

	// // TODO: check accounts with uncommon email domains
	// if (domain === "gmail.com" || domain === "googlemail.com") {
	// 	// replace .dots and +alternatives -> Gmail Dot Trick https://support.google.com/mail/answer/7436150 and https://generator.email/blog/gmail-generator
	// 	const v = user.replace(/[.]|(\+.*)/g, "") + "@gmail.com";
	// }

	// if (domain === "google.com") {
	// 	// replace .dots and +alternatives -> Google Staff GMail Dot Trick
	// 	const v = user.replace(/[.]|(\+.*)/g, "") + "@google.com";
	// }

	// return email;
}

const transporters: {
	[key: string]: () => Promise<Transporter<unknown> | void>;
} = {
	smtp: SMTP,
	mailgun: MailGun,
	mailjet: MailJet,
	sendgrid: SendGrid,
};

export const Email: {
	transporter: Transporter | null;
	init: () => Promise<void>;
	generateLink: (
		type: "verify" | "reset",
		id: string,
		email: string,
	) => Promise<string>;
	sendVerifyEmail: (user: User, email: string) => Promise<SentMessageInfo>;
	sendResetPassword: (user: User, email: string) => Promise<SentMessageInfo>;
	sendPasswordChanged: (
		user: User,
		email: string,
	) => Promise<SentMessageInfo>;
	doReplacements: (
		template: string,
		user: User,
		emailVerificationUrl?: string,
		passwordResetUrl?: string,
		ipInfo?: {
			ip: string;
			city: string;
			region: string;
			country_name: string;
		},
	) => string;
} = {
	transporter: null,
	init: async function () {
		const { provider } = Config.get().email;
		if (!provider) return;

		const transporterFn = transporters[provider];
		if (!transporterFn)
			return console.error(`[Email] Invalid provider: ${provider}`);
		console.log(`[Email] Initializing ${provider} transport...`);
		const transporter = await transporterFn();
		if (!transporter) return;
		this.transporter = transporter;
		console.log(`[Email] ${provider} transport initialized.`);
	},
	/**
	 * Replaces all placeholders in an email template with the correct values
	 */
	doReplacements: function (
		template,
		user,
		emailVerificationUrl?,
		passwordResetUrl?,
		ipInfo?: {
			ip: string;
			city: string;
			region: string;
			country_name: string;
		},
	) {
		const { instanceName } = Config.get().general;

		const replacements = [
			["{instanceName}", instanceName],
			["{userUsername}", user.username],
			["{userDiscriminator}", user.discriminator],
			["{userId}", user.id],
			["{phoneNumber}", user.phone?.slice(-4)],
			["{userEmail}", user.email],
			["{emailVerificationUrl}", emailVerificationUrl],
			["{passwordResetUrl}", passwordResetUrl],
			["{ipAddress}", ipInfo?.ip],
			["{locationCity}", ipInfo?.city],
			["{locationRegion}", ipInfo?.region],
			["{locationCountryName}", ipInfo?.country_name],
		];

		// loop through all replacements and replace them in the template
		for (const [key, value] of Object.values(replacements)) {
			if (!value) continue;
			template = template.replaceAll(key as string, value);
		}

		return template;
	},
	/**
	 *
	 * @param id user id
	 * @param email user email
	 */
	generateLink: async function (type, id, email) {
		const token = (await generateToken(id, email)) as string;
		const instanceUrl =
			Config.get().general.frontPage || "http://localhost:3001";
		const link = `${instanceUrl}/${type}#token=${token}`;
		return link;
	},
	/**
	 * Sends an email to the user with a link to verify their email address
	 */
	sendVerifyEmail: async function (user, email) {
		if (!this.transporter) return;

		// generate a verification link for the user
		const link = await this.generateLink("verify", user.id, email);

		// load the email template
		const rawTemplate = fs.readFileSync(
			path.join(
				ASSET_FOLDER_PATH,
				"email_templates",
				"verify_email.html",
			),
			{ encoding: "utf-8" },
		);

		// replace email template placeholders
		const html = this.doReplacements(rawTemplate, user, link);

		// extract the title from the email template to use as the email subject
		const subject = html.match(/<title>(.*)<\/title>/)?.[1] || "";

		// construct the email
		const message = {
			from:
				Config.get().general.correspondenceEmail || "noreply@localhost",
			to: email,
			subject,
			html,
		};

		// send the email
		return this.transporter.sendMail(message);
	},
	/**
	 * Sends an email to the user with a link to reset their password
	 */
	sendResetPassword: async function (user, email) {
		if (!this.transporter) return;

		// generate a password reset link for the user
		const link = await this.generateLink("reset", user.id, email);

		// load the email template
		const rawTemplate = await fs.promises.readFile(
			path.join(
				ASSET_FOLDER_PATH,
				"email_templates",
				"password_reset_request.html",
			),
			{ encoding: "utf-8" },
		);

		// replace email template placeholders
		const html = this.doReplacements(rawTemplate, user, undefined, link);

		// extract the title from the email template to use as the email subject
		const subject = html.match(/<title>(.*)<\/title>/)?.[1] || "";

		// construct the email
		const message = {
			from:
				Config.get().general.correspondenceEmail || "noreply@localhost",
			to: email,
			subject,
			html,
		};

		// send the email
		return this.transporter.sendMail(message);
	},
	/**
	 * Sends an email to the user notifying them that their password has been changed
	 */
	sendPasswordChanged: async function (user, email) {
		if (!this.transporter) return;

		// load the email template
		const rawTemplate = await fs.promises.readFile(
			path.join(
				ASSET_FOLDER_PATH,
				"email_templates",
				"password_changed.html",
			),
			{ encoding: "utf-8" },
		);

		// replace email template placeholders
		const html = this.doReplacements(rawTemplate, user);

		// extract the title from the email template to use as the email subject
		const subject = html.match(/<title>(.*)<\/title>/)?.[1] || "";

		// construct the email
		const message = {
			from:
				Config.get().general.correspondenceEmail || "noreply@localhost",
			to: email,
			subject,
			html,
		};

		// send the email
		return this.transporter.sendMail(message);
	},
};
