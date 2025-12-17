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

import fs from "fs/promises";
import path from "node:path";
import { User } from "../../entities";
import { Config } from "../Config";
import { generateToken } from "../Token";
import { IEmail, IEmailClient } from "./clients/IEmailClient";
import { SendGridEmailClient } from "./clients/SendGridEmailClient";
import { SMTPEmailClient } from "./clients/SMTPEmailClient";
import { MailGunEmailClient } from "./clients/MailGunEmailClient";
import { MailJetEmailClient } from "./clients/MailJetEmailClient";

const ASSET_FOLDER_PATH = path.join(__dirname, "..", "..", "..", "..", "assets");

export enum MailTypes {
    verifyEmail = "verifyEmail",
    resetPassword = "resetPassword",
    changePassword = "changePassword",
}

export const Email: {
    transporter: IEmailClient | null;
    init: () => Promise<void>;
    generateLink: (type: Omit<MailTypes, "changePassword">, id: string) => Promise<string>;
    sendMail: (type: MailTypes, user: User, email: string) => Promise<void>;
    sendVerifyEmail: (user: User, email: string) => Promise<void>;
    sendResetPassword: (user: User, email: string) => Promise<void>;
    sendPasswordChanged: (user: User, email: string) => Promise<void>;
    doReplacements: (
        template: string,
        user: User,
        actionUrl?: string,
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

        switch (provider) {
            case "smtp":
                this.transporter = new SMTPEmailClient();
                break;
            case "sendgrid":
                this.transporter = new SendGridEmailClient();
                break;
            case "mailgun":
                this.transporter = new MailGunEmailClient();
                break;
            case "mailjet":
                this.transporter = new MailJetEmailClient();
                break;
            default:
                console.error(`[Email] Invalid provider: ${provider}`);
                return;
        }

        if (!this.transporter) return console.error(`[Email] Invalid provider: ${provider}`);
        console.log(`[Email] Initializing ${provider} transport...`);
        await this.transporter.init();
        console.log(`[Email] ${provider} transport initialized.`);
    },

    /**
     * Replaces all placeholders in an email template with the correct values
     */
    doReplacements: function (
        template,
        user,
        actionUrl?,
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
            ["{actionUrl}", actionUrl],
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
     */
    generateLink: async function (type, id) {
        const token = (await generateToken(id)) as string;
        // puyodead1: this is set to api endpoint because the verification page is on the server since no clients have one, and not all 3rd party clients will have one
        const instanceUrl = Config.get().api.endpointPublic?.replace("/api", "");
        const dashedType = type.replace(/([A-Z])/g, "-$1").toLowerCase();
        const link = `${instanceUrl}/${dashedType}#token=${token}`;
        return link;
    },

    /**
     *
     * @param type the MailType to send
     * @param user the user to address it to
     * @param email the email to send it to
     * @returns
     */
    sendMail: async function (type, user, email) {
        if (!this.transporter) return;

        const htmlTemplateNames: { [key in MailTypes]: string } = {
            verifyEmail: "verify_email.html",
            resetPassword: "password_reset_request.html",
            changePassword: "password_changed.html",
        };

        const textTemplateNames: { [key in MailTypes]: string } = {
            verifyEmail: "verify_email.txt",
            resetPassword: "password_reset_request.txt",
            changePassword: "password_changed.txt",
        };

        const htmlTemplate = await fs.readFile(path.join(ASSET_FOLDER_PATH, "email_templates", htmlTemplateNames[type]), { encoding: "utf-8" });

        const textTemplate = await fs.readFile(path.join(ASSET_FOLDER_PATH, "email_templates", textTemplateNames[type]), { encoding: "utf-8" });

        // replace email template placeholders
        const html = this.doReplacements(
            htmlTemplate,
            user,
            // password change emails don't have links
            type != MailTypes.changePassword ? await this.generateLink(type, user.id) : undefined,
        );

        const text = this.doReplacements(
            textTemplate,
            user,
            // password change emails don't have links
            type != MailTypes.changePassword ? await this.generateLink(type, user.id) : undefined,
        );

        // extract the title from the email template to use as the email subject
        const subject = html.match(/<title>(.*)<\/title>/)?.[1] || "";

        const message: IEmail = {
            from: Config.get().email.senderAddress || Config.get().general.correspondenceEmail || "noreply@localhost",
            to: email,
            subject,
            text,
            html,
        };

        return this.transporter.sendMail(message);
    },

    /**
     * Sends an email to the user with a link to verify their email address
     */
    sendVerifyEmail: async function (user, email) {
        return this.sendMail(MailTypes.verifyEmail, user, email);
    },

    /**
     * Sends an email to the user with a link to reset their password
     */
    sendResetPassword: async function (user, email) {
        return this.sendMail(MailTypes.resetPassword, user, email);
    },

    /**
     * Sends an email to the user notifying them that their password has been changed
     */
    sendPasswordChanged: async function (user, email) {
        return this.sendMail(MailTypes.changePassword, user, email);
    },
};
