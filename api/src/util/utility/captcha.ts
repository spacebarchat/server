import { Config } from "@fosscord/util";
import fetch from "node-fetch";

export interface hcaptchaResponse {
	success: boolean;
	challenge_ts: string;
	hostname: string;
	credit: boolean;
	"error-codes": string[];
	score: number;	// enterprise only
	score_reason: string[];	// enterprise only
}

export async function verifyHcaptcha(response: string, ip?: string) {
	const { security } = Config.get();
	const { secret, sitekey } = security.captcha;
	
	const res = await fetch("https://hcaptcha.com/siteverify", {
		method: "POST",
		body: `response=${response}&secret=${secret}&remoteip=${ip}&sitekey=${sitekey}`,
	})

	const json = await res.json() as hcaptchaResponse;
	return json;
}