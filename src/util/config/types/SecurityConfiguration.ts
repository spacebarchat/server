import crypto from "crypto";
import { CaptchaConfiguration, TwoFactorConfiguration } from ".";

export class SecurityConfiguration {
	//classes
	captcha: CaptchaConfiguration = new CaptchaConfiguration();
	twoFactor: TwoFactorConfiguration = new TwoFactorConfiguration();
	//base types
	autoUpdate: boolean | number = true;
	requestSignature: string = crypto.randomBytes(32).toString("base64");
	jwtSecret: string = crypto.randomBytes(256).toString("base64");
	// header to get the real user ip address
	// X-Forwarded-For for nginx/reverse proxies
	// CF-Connecting-IP for cloudflare
	forwadedFor: string | null = null;
	ipdataApiKey: string | null = "eca677b284b3bac29eb72f5e496aa9047f26543605efe99ff2ce35c9";
	mfaBackupCodeCount: number = 10;
	mfaBackupCodeBytes: number = 4;
	statsWorldReadable: boolean = true;
}
