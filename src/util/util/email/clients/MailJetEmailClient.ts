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

export class MailJetEmailClient extends BaseEmailClient {
    mailJet?: unknown;
    // mailJet?: import("node-mailjet").default; // for development - doesn't work if package isn't installed
    override async init(): Promise<void> {
        // get configuration
        const { apiKey, apiSecret } = Config.get().email.mailjet;

        // ensure all required configuration values are set
        if (!apiKey || !apiSecret) return console.error("[Email] Mailjet has not been configured correctly.");

        try {
            // try to import the transporter package
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            this.mailJet = new (await import("node-mailjet")).default({
                apiKey: apiKey,
                apiSecret: apiSecret,
            });
        } catch {
            // if the package is not installed, log an error and return void so we don't set the transporter
            console.error("[Email] MailJet transport is not installed. Please run `npm install node-mailjet --save-optional` to install it.");
            return;
        }
    }

    override async sendMail(email: IEmail): Promise<void> {
        if (!this.mailJet) throw new Error("mailJet not initialized");

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        await this.mailJet.post("send", { version: "v3.1" }).request({
            Messages: [
                {
                    From: {
                        Email: Config.get().email.senderAddress,
                        Name: Config.get().general.instanceName,
                    },
                    To: [
                        {
                            Email: email.to,
                        },
                    ],
                    Subject: email.subject,
                    TextPart: email.text,
                    HTMLPart: email.html,
                },
            ],
        });
    }
}
