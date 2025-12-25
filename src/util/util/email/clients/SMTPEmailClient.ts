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

export class SMTPEmailClient extends BaseEmailClient {
    nodemailer?: unknown;
    transporter: unknown;
    // nodemailer?: typeof import("nodemailer"); // for dev
    // transporter: import("nodemailer").Transporter; // for dev
    override async init(): Promise<void> {
        try {
            // try to import the transporter package
            this.nodemailer = require("nodemailer").default;
        } catch {
            // if the package is not installed, log an error and return void so we don't set the transporter
            console.error("[Email] nodemailer is not installed. Please run `npm install --no-save nodemailer` to install it.");
            return;
        }
        // get configuration
        const { host, port, secure, username, password } = Config.get().email.smtp;

        // ensure all required configuration values are set
        if (!host || !port || secure === null || !username || !password) return console.error("[Email] SMTP has not been configured correctly.");

        if (!Config.get().email.senderAddress && !Config.get().general.correspondenceEmail)
            return console.error(
                '[Email] You have to configure either "email_senderAddress" or "general_correspondenceEmail" for emails to work. The configured value is used as the sender address.',
            );

        // construct the transporter
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const transporter = this.nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user: username,
                pass: password,
            },
        });

        // verify connection configuration
        const verified = await transporter.verify().catch((err: unknown) => {
            console.error("[Email] SMTP verification failed:", err);
            return;
        });

        // if verification failed, return void and don't set transporter
        if (!verified) return;

        this.transporter = transporter;
    }

    override async sendMail(email: IEmail): Promise<void> {
        if (!this.nodemailer) throw new Error("nodemailer not initialized");
        if (!this.transporter) throw new Error("nodemailer transporter not initialized");

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        await this.transporter.sendMail({
            to: email.to,
            from: email.from,
            subject: email.subject,
            text: email.text,
            html: email.html,
        });
    }
}
