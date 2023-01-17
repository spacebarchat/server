import { Config } from "@fosscord/util";
import fetch from "node-fetch";

export interface hcaptchaResponse {
	success: boolean;
	challenge_ts: string;
	hostname: string;
	credit: boolean;
	"error-codes": string[];
	score: number; // enterprise only
	score_reason: string[]; // enterprise only
}

export interface recaptchaResponse {
	success: boolean;
	score: number; // between 0 - 1
	action: string;
	challenge_ts: string;
	hostname: string;
	"error-codes"?: string[];
}

const verifyEndpoints = {
	hcaptcha: "https://hcaptcha.com/siteverify",
	recaptcha: "https://www.google.com/recaptcha/api/siteverify",
};

export async function verifyCaptcha(response: string, ip?: string) {
	const { security } = Config.get();
	const { service, secret, sitekey } = security.captcha;

	if (!service || !secret || !sitekey)
		throw new Error(
			"CAPTCHA is not configured correctly. https://docs.fosscord.com/setup/server/security/captcha/",
		);

	const res = await fetch(verifyEndpoints[service], {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body:
			`response=${encodeURIComponent(response)}` +
			`&secret=${encodeURIComponent(secret)}` +
			`&sitekey=${encodeURIComponent(sitekey)}` +
			(ip ? `&remoteip=${encodeURIComponent(ip)}` : ""),
	});

	return (await res.json()) as hcaptchaResponse | recaptchaResponse;
}
