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

import nodemailer, { Transporter } from "nodemailer";
import { Config } from "./Config";
import { generateToken } from "./Token";

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

export const Email: {
	transporter: Transporter | null;
	init: () => Promise<void>;
	sendVerificationEmail: (id: string, email: string) => Promise<any>;
} = {
	transporter: null,
	init: async function () {
		const { host, port, secure, username, password } = Config.get().smtp;
		if (!host || !port || !secure || !username || !password) return;
		console.log(`[SMTP] connect: ${host}`);
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
				console.error(`[SMTP] error: ${error}`);
				this.transporter?.close();
				this.transporter = null;
				return;
			}
			console.log(`[SMTP] Ready`);
		});
	},
	sendVerificationEmail: async function (
		id: string,
		email: string,
	): Promise<any> {
		if (!this.transporter) return;
		const token = (await generateToken(id, email)) as string;
		const instanceUrl =
			Config.get().general.frontPage || "http://localhost:3001";
		const link = `${instanceUrl}/verify#token=${token}`;
		const message = {
			from:
				Config.get().general.correspondenceEmail || "noreply@localhost",
			to: email,
			subject: `Verify Email Address for ${
				Config.get().general.instanceName
			}`,
			html: `Please verify your email address by clicking the following link: <a href="${link}">Verify Email</a>`,
		};

		return this.transporter.sendMail(message);
	},
};
