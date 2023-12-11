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

import crypto from "crypto";
import { CaptchaConfiguration, TwoFactorConfiguration } from ".";

export class SecurityConfiguration {
	captcha: CaptchaConfiguration = new CaptchaConfiguration();
	twoFactor: TwoFactorConfiguration = new TwoFactorConfiguration();
	autoUpdate: boolean | number = true;
	requestSignature: string = crypto.randomBytes(32).toString("base64");
	jwtSecret: string = crypto.randomBytes(256).toString("base64");
	// header to get the real user ip address
	// X-Forwarded-For for nginx/reverse proxies
	// CF-Connecting-IP for cloudflare
	forwardedFor: string | null = null;
	ipdataApiKey: string | null = "eca677b284b3bac29eb72f5e496aa9047f26543605efe99ff2ce35c9";
	mfaBackupCodeCount: number = 10;
	statsWorldReadable: boolean = true;
	defaultRegistrationTokenExpiration: number = 1000 * 60 * 60 * 24 * 7; //1 week
}
