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

import { Config } from "@spacebar/util";
import nodemailer from "nodemailer";

export default async function () {
	// get configuration
	const { host, port, secure, username, password } = Config.get().email.smtp;

	// ensure all required configuration values are set
	if (!host || !port || secure === null || !username || !password)
		return console.error("[Email] SMTP has not been configured correctly.");

	if (!Config.get().general.correspondenceEmail)
		return console.error(
			"[Email] Correspondence email has not been configured! This is used as the sender email address.",
		);

	// construct the transporter
	const transporter = nodemailer.createTransport({
		host,
		port,
		secure,
		auth: {
			user: username,
			pass: password,
		},
	});

	// verify connection configuration
	const verified = await transporter.verify().catch((err) => {
		console.error("[Email] SMTP verification failed:", err);
		return;
	});

	// if verification failed, return void and don't set transporter
	if (!verified) return;

	return transporter;
}
