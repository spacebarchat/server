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
import { Config } from "@spacebar/util";

export class SendGridEmailClient extends BaseEmailClient {
    sendGrid?: unknown;
    // sendGrid?: typeof import("@sendgrid/mail"); // for development - doesn't work if package isn't installed
    override async init(): Promise<void> {
        // get configuration
        const { apiKey } = Config.get().email.sendgrid;

        // ensure all required configuration values are set
        if (!apiKey) return console.error("[Email] SendGrid has not been configured correctly.");

        try {
            // try to import the transporter package
            this.sendGrid = (await import("@sendgrid/mail")).default;
        } catch {
            // if the package is not installed, log an error and return void so we don't set the transporter
            console.error("[Email] SendGrid transport is not installed. Please run `npm install @sendgrid/mail --save-optional` to install it.");
            return;
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        this.sendGrid.setApiKey(apiKey);
    }

    override async sendMail(email: IEmail): Promise<void> {
        if (!this.sendGrid) throw new Error("SendGrid not initialized");

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        await this.sendGrid.send({
            to: email.to,
            from: email.from,
            subject: email.subject,
            text: email.text,
            html: email.html,
        });
    }
}
