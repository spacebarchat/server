/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
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
import nodemailer, { Transporter } from "nodemailer";
import { User } from "../entities";
import { Config } from "./Config";
import { generateToken } from "./Token";

const ASSET_FOLDER_PATH = path.join(__dirname, "..", "..", "..", "assets");
export const EMAIL_REGEX =
	/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function adjustEmail(email?: string): string | undefined {
	if (!email) return email;
	// body parser already checked if it is a valid email
	const parts = <RegExpMatchArray>email.match(EMAIL_REGEX);
	// @ts-ignore
	if (!parts || parts.length < 5) return undefined;
	const domain = parts[5];
	const user = parts[1];

	// TODO: check accounts with uncommon email domains
	if (domain === "gmail.com" || domain === "googlemail.com") {
		// replace .dots and +alternatives -> Gmail Dot Trick https://support.google.com/mail/answer/7436150 and https://generator.email/blog/gmail-generator
		let v = user.replace(/[.]|(\+.*)/g, "") + "@gmail.com";
	}

	if (domain === "google.com") {
		// replace .dots and +alternatives -> Google Staff GMail Dot Trick
		let v = user.replace(/[.]|(\+.*)/g, "") + "@google.com";
	}

	return email;
}

export const Email: {
	transporter: Transporter | null;
	init: () => Promise<void>;
	initSMTP: () => Promise<void>;
	initMailgun: () => Promise<void>;
	generateVerificationLink: (id: string, email: string) => Promise<string>;
	sendVerificationEmail: (user: User, email: string) => Promise<any>;
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

		if (provider === "smtp") await this.initSMTP();
		else if (provider === "mailgun") await this.initMailgun();
		else throw new Error(`Unknown email provider: ${provider}`);
	},
	initSMTP: async function () {
		const { host, port, secure, username, password } =
			Config.get().email.smtp;
		if (!host || !port || !secure || !username || !password)
			return console.error(
				"[Email] SMTP has not been configured correctly.",
			);

		console.log(`[Email] Initializing SMTP transport: ${host}`);
		this.transporter = nodemailer.createTransport({
			host,
			port,
			secure,
			auth: {
				user: username,
				pass: password,
			},
		});

		await this.transporter.verify((error, _) => {
			if (error) {
				console.error(`[Email] SMTP error: ${error}`);
				this.transporter?.close();
				this.transporter = null;
				return;
			}
			console.log(`[Email] Ready`);
		});
	},
	initMailgun: async function () {
		const { apiKey, domain } = Config.get().email.mailgun;
		if (!apiKey || !domain)
			return console.error(
				"[Email] Mailgun has not been configured correctly.",
			);

		try {
			const mg = require("nodemailer-mailgun-transport");
			const auth = {
				auth: {
					api_key: apiKey,
					domain: domain,
				},
			};

			console.log(`[Email] Initializing Mailgun transport...`);
			this.transporter = nodemailer.createTransport(mg(auth));
			console.log(`[Email] Ready`);
		} catch {
			console.error(
				"[Email] Mailgun transport is not installed. Please run `npm install nodemailer-mailgun-transport --save` to install it.",
			);
			return;
		}
	},
	/**
	 * Replaces all placeholders in an email template with the correct values
	 */
	doReplacements: function (
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
	) {
		const { instanceName } = Config.get().general;
		template = template.replaceAll("{instanceName}", instanceName);
		template = template.replaceAll("{userUsername}", user.username);
		template = template.replaceAll(
			"{userDiscriminator}",
			user.discriminator,
		);
		template = template.replaceAll("{userId}", user.id);
		if (user.phone)
			template = template.replaceAll(
				"{phoneNumber}",
				user.phone.slice(-4),
			);
		if (user.email)
			template = template.replaceAll("{userEmail}", user.email);

		// template specific replacements
		if (emailVerificationUrl)
			template = template.replaceAll(
				"{emailVerificationUrl}",
				emailVerificationUrl,
			);
		if (passwordResetUrl)
			template = template.replaceAll(
				"{passwordResetUrl}",
				passwordResetUrl,
			);
		if (ipInfo) {
			template = template.replaceAll("{ipAddress}", ipInfo.ip);
			template = template.replaceAll("{locationCity}", ipInfo.city);
			template = template.replaceAll("{locationRegion}", ipInfo.region);
			template = template.replaceAll(
				"{locationCountryName}",
				ipInfo.country_name,
			);
		}

		return template;
	},
	/**
	 *
	 * @param id user id
	 * @param email user email
	 * @returns a verification link for the user
	 */
	generateVerificationLink: async function (id: string, email: string) {
		const token = (await generateToken(id, email)) as string;
		const instanceUrl =
			Config.get().general.frontPage || "http://localhost:3001";
		const link = `${instanceUrl}/verify#token=${token}`;
		return link;
	},
	sendVerificationEmail: async function (
		user: User,
		email: string,
	): Promise<any> {
		if (!this.transporter) return;

		// generate a verification link for the user
		const verificationLink = await this.generateVerificationLink(
			user.id,
			email,
		);
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
		const html = this.doReplacements(rawTemplate, user, verificationLink);

		// extract the title from the email template to use as the email subject
		const subject = html.match(/<title>(.*)<\/title>/)?.[1] || "";

		// // construct the email
		const message = {
			from:
				Config.get().general.correspondenceEmail || "noreply@localhost",
			to: email,
			subject,
			html,
		};

		// // send the email
		return this.transporter.sendMail(message);
	},
};
