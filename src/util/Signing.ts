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
import { createHmac, timingSafeEqual } from "crypto";
import ms, { StringValue } from "ms";
import * as console from "node:console";

export class NewUrlUserSignatureData {
	ip?: string;
	userAgent?: string;

	constructor(data: NewUrlUserSignatureData) {
		this.ip = data.ip;
		this.userAgent = data.userAgent;
	}
}

export class NewUrlSignatureData extends NewUrlUserSignatureData {
	path?: string;
	url?: string;

	constructor(data: NewUrlSignatureData) {
		super(data);
		this.path = data.path;
		this.url = data.url;
		if (!this.path && !this.url) {
			throw new Error(
				"Either path or url must be provided for URL signing",
			);
		}
		if (this.path && this.url) {
			console.warn(
				"[Signing] Both path and url are provided, using path for signing",
				new Error().stack,
			);
		}
		if (this.url) {
			try {
				const parsedUrl = new URL(this.url);
				this.path = parsedUrl.pathname;
			} catch (e) {
				throw new Error(
					"Invalid URL provided for signing: " + this.url,
				);
			}
		}
	}
}

export class UrlSignatureData extends NewUrlSignatureData {
	issuedAt: string;
	expiresAt: string;

	constructor(data: UrlSignatureData) {
		super(data);
		this.issuedAt = data.issuedAt;
		this.expiresAt = data.expiresAt;
	}
}

export class UrlSignResult {
	path: string;
	hash: string;
	issuedAt: string;
	expiresAt: string;

	constructor(data: Partial<UrlSignResult>) {
		for (const key in data) {
			// @ts-expect-error TS7053 - We dont care about string indexing a class
			this[key] = data[key];
		}
	}

	applyToUrl(url: URL | string): URL {
		if (typeof url === "string") {
			url = new URL(url);
		}
		url.searchParams.set("ex", this.expiresAt);
		url.searchParams.set("is", this.issuedAt);
		url.searchParams.set("hm", this.hash);
		return url;
	}

	static fromUrl(url: URL | string): UrlSignResult {
		if (typeof url === "string") {
			if (process.env["LOG_CDN_SIGNATURES"])
				console.debug("[Signing] Parsing URL from string:", url);
			url = new URL(url);
		}
		if (process.env["LOG_CDN_SIGNATURES"])
			console.debug(
				"[Signing] Parsing URL from URL object:",
				url.toString(),
			);
		const ex = url.searchParams.get("ex");
		const is = url.searchParams.get("is");
		const hm = url.searchParams.get("hm");

		if (!ex || !is || !hm) {
			throw new Error("Invalid URL signature parameters");
		}

		return new UrlSignResult({
			path: url.pathname,
			issuedAt: is,
			expiresAt: ex,
			hash: hm,
		});
	}
}

export const getUrlSignature = (data: NewUrlSignatureData): UrlSignResult => {
	const { cdnSignatureKey, cdnSignatureDuration } = Config.get().security;

	// calculate the expiration time
	const now = Date.now();
	const issuedAt = now.toString(16);
	const expiresAt = (now + ms(cdnSignatureDuration as StringValue)).toString(
		16,
	);

	// hash the url with the cdnSignatureKey
	return calculateHash(
		new UrlSignatureData({
			...data,
			issuedAt,
			expiresAt,
		}),
	);
};

function calculateHash(request: UrlSignatureData): UrlSignResult {
	const { cdnSignatureKey } = Config.get().security;
	const data = createHmac("sha256", cdnSignatureKey as string)
		.update(request.path!)
		.update(request.issuedAt)
		.update(request.expiresAt);

	if (Config.get().security.cdnSignatureIncludeIp) {
		if (!request.ip)
			console.log(
				"[Signing] CDN Signature IP is enabled but we couldn't find the IP field in the request. This may cause issues with signature validation. Please report this to the Spacebar team!",
			);
		else {
			if (process.env["LOG_CDN_SIGNATURES"])
				console.log(
					"[Signing] CDN Signature IP is enabled, adding IP to hash:",
					request.ip,
				);
			data.update(request.ip!);
		}
	}

	if (Config.get().security.cdnSignatureIncludeUserAgent) {
		if (!request.userAgent)
			console.log(
				"[Signing] CDN Signature User-Agent is enabled but we couldn't find the user-agent header in the request. This may cause issues with signature validation. Please report this to the Spacebar team!",
			);
		else {
			if (process.env["LOG_CDN_SIGNATURES"])
				console.log(
					"[Signing] CDN Signature User-Agent is enabled, adding User-Agent to hash:",
					request.userAgent,
				);
			data.update(request.userAgent!);
		}
	}

	const hash = data.digest("hex");
	const result = new UrlSignResult({
		path: request.path,
		issuedAt: request.issuedAt,
		expiresAt: request.expiresAt,
		hash,
	});
	if (process.env["LOG_CDN_SIGNATURES"])
		console.log(
			"[Signing]",
			{
				path: request.path,
				validity: request.issuedAt + " .. " + request.expiresAt,
				ua: Config.get().security.cdnSignatureIncludeUserAgent
					? request.userAgent
					: "[disabled]",
				ip: Config.get().security.cdnSignatureIncludeIp
					? request.ip
					: "[disabled]",
			},
			"->",
			result,
		);
	return result;
}

export const isExpired = (data: UrlSignResult | UrlSignatureData) => {
	// convert issued at
	const issuedAt = parseInt(data.issuedAt, 16);
	const expiresAt = parseInt(data.expiresAt, 16);

	if (Number.isNaN(issuedAt) || Number.isNaN(expiresAt)) {
		if (process.env["LOG_CDN_SIGNATURES"])
			console.debug("[Signing] Invalid timestamps in query");
		return true;
	}

	const currentTime = Date.now();

	const isExpired = expiresAt < currentTime;
	if (isExpired) {
		if (process.env["LOG_CDN_SIGNATURES"])
			console.debug("[Signing] Signature expired");
		return true;
	}

	const isValidIssuedAt = issuedAt < currentTime;
	if (!isValidIssuedAt) {
		if (process.env["LOG_CDN_SIGNATURES"])
			console.debug("[Signing] Signature issued in the future");
		return true;
	}

	return false;
};

export const hasValidSignature = (
	req: NewUrlUserSignatureData,
	sig: UrlSignResult,
) => {
	// if the required query parameters are not present, return false
	if (!sig.expiresAt || !sig.issuedAt || !sig.hash) {
		if (process.env["LOG_CDN_SIGNATURES"])
			console.warn(
				"[Signing] Missing required query parameters for signature validation",
			);
		return false;
	}

	// check if the signature is expired
	if (isExpired(sig)) {
		if (process.env["LOG_CDN_SIGNATURES"])
			console.warn("[Signing] Signature is expired");
		return false;
	}

	const calcResult = calculateHash(
		new UrlSignatureData({
			path: sig.path,
			issuedAt: sig.issuedAt,
			expiresAt: sig.expiresAt,
			ip: req.ip,
			userAgent: req.userAgent,
		}),
	);
	const calcd = calcResult.hash;
	const calculated = Buffer.from(calcd);
	const received = Buffer.from(sig.hash as string);

	console.assert(
		sig.issuedAt == calcResult.issuedAt,
		"[Signing] Mismatched issuedAt",
		{
			is: sig.issuedAt,
			calculated: calcResult.issuedAt,
		},
	);

	console.assert(
		sig.expiresAt == calcResult.expiresAt,
		"[Signing] Mismatched expiresAt",
		{
			ex: sig.expiresAt,
			calculated: calcResult.expiresAt,
		},
	);

	console.assert(
		calculated.length === received.length,
		"[Signing] Mismatched hash length",
		{
			calculated: calculated.length,
			received: received.length,
		},
	);

	const isHashValid =
		calculated.length === received.length &&
		timingSafeEqual(calculated, received);

	if (!isHashValid)
		if (process.env["LOG_CDN_SIGNATURES"])
			console.warn(
				`Signature validation for ${sig.path} (is=${sig.issuedAt}, ex=${sig.expiresAt}) failed: calculated: ${calcd}, received: ${sig.hash}`,
			);

	return isHashValid;
};
