/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors

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

import { BaseEmailClient, IEmail } from "./IEmailClient";
import { Config } from "@spacebar/util*";

// NOTE: mailgun supports SMTP, is there any point in maintaining this?
export class MailGunEmailClient extends BaseEmailClient {
	mailGun?: unknown;
	mailGunClient?: unknown;
	// mailGun?: import("mailgun.js").default; // for development - doesn't work if package isn't installed
	// mailGunClient?: import("mailgun.js/Classes/MailgunClient").default; // for development - doesn't work if package isn't installed
	override async init(): Promise<void> {
		// get configuration
		const { apiKey, username, domain, isEuropean } = Config.get().email.mailgun;

		// ensure all required configuration values are set
		if (!apiKey || !domain || !username) return console.error("[Email] Mailgun has not been configured correctly.");

		try {
			// try to import the transporter package
			this.mailGun = new (await import("mailgun.js")).default(FormData);
		} catch {
			// if the package is not installed, log an error and return void so we don't set the transporter
			console.error("[Email] MailGun transport is not installed. Please run `npm install mailgun.js --save-optional` to install it.");
			return;
		}

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		this.mailGun.client({ username: username, key: apiKey, url: isEuropean ? "https://api.eu.mailgun.net" : undefined });
	}

	override async sendMail(email: IEmail): Promise<void> {
		if (!this.mailGun) throw new Error("MailGun not initialized");
		if (!this.mailGunClient) throw new Error("MailGun not initialized");
		const { domain } = Config.get().email.mailgun;
		if (!domain) throw new Error("MailGun domain not configured");

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		await this.mailGunClient.messages.create(domain, {
			to: email.to,
			from: email.from,
			subject: email.subject,
			text: email.text,
			html: email.html,
		});
	}
}
