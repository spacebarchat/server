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
import { ParsedQs } from "qs";
import { Request } from "express";

export const getUrlSignature = (
	path: string,
	req: Request,
) => {
	const { cdnSignatureKey, cdnSignatureDuration } = Config.get().security;

	// calculate the expiration time
	const now = Date.now();
	const issuedAt = now.toString(16);
	const expiresAt = (now + ms(cdnSignatureDuration as StringValue)).toString(
		16,
	);

	// hash the url with the cdnSignatureKey
	const hash = calculateHash(path, issuedAt, expiresAt, req);

	return {
		hash,
		issuedAt,
		expiresAt,
	};
};

export const calculateHash = (
	url: string,
	issuedAt: string,
	expiresAt: string,
	req: Request,
) => {
	const { cdnSignatureKey } = Config.get().security;
	const hash = createHmac("sha256", cdnSignatureKey as string)
		.update(url)
		.update(issuedAt)
		.update(expiresAt);

	if (Config.get().security.cdnSignatureIncludeIp) {
		if (!req || !req.ip)
			console.log(
				"[Signing] CDN Signature IP is enabled but no request object was provided. This may cause issues with signature validation. Please report this to the Spacebar team!",
			);
		hash.update(req.ip!);
	}

	if (Config.get().security.cdnSignatureIncludeUserAgent) {
		if (!req || !req.headers || !req.headers["user-agent"])
			console.log(
				"[Signing] CDN Signature User-Agent is enabled but no request object was provided. This may cause issues with signature validation. Please report this to the Spacebar team!",
			);
		hash.update(req.headers["user-agent"] as string);
	}

	return hash.digest("hex");
};

export const isExpired = (ex: string, is: string) => {
	// convert issued at
	const issuedAt = parseInt(is, 16);
	const expiresAt = parseInt(ex, 16);

	if (Number.isNaN(issuedAt) || Number.isNaN(expiresAt)) {
		// console.debug("Invalid timestamps in query");
		return true;
	}

	const currentTime = Date.now();
	const isExpired = expiresAt < currentTime;
	const isValidIssuedAt = issuedAt < currentTime;
	if (isExpired || !isValidIssuedAt) {
		// console.debug("Signature expired");
		return true;
	}

	return false;
};

export const hasValidSignature = (path: string, query: ParsedQs, req: Request) => {
	// get url path
	const { ex, is, hm } = query;

	// if the required query parameters are not present, return false
	if (!ex || !is || !hm) {
		console.debug("Missing required query parameters for signature validation");
		return false;
	}

	// check if the signature is expired
	if (isExpired(ex as string, is as string)) {
		console.debug("Signature is expired");
		return false;
	}

	const calcd = calculateHash(path, is as string, ex as string, req);
	const calculated = Buffer.from(calcd);
	const received = Buffer.from(hm as string);

	const isHashValid =
		calculated.length === received.length &&
		timingSafeEqual(calculated, received);

	console.debug(
		`Signature validation for ${path} - isHashValid: ${isHashValid}, calculated: ${calcd}, received: ${hm}`,
	);

	return isHashValid;
};

export const resignUrl = (attachmentUrl: string, req: Request) => {
	const url = new URL(attachmentUrl);

	// if theres an existing signature, check if its expired or not. no reason to resign if its not expired
	if (url.searchParams.has("ex") && url.searchParams.has("is")) {
		// extract the ex and is
		const ex = url.searchParams.get("ex");
		const is = url.searchParams.get("is");

		if (!isExpired(ex as string, is as string)) {
			// if the signature is not expired, return the url as is
			return attachmentUrl;
		}
	}

	let path = url.pathname;
	// strip / from the start
	if (path.startsWith("/")) {
		path = path.slice(1);
	}

	const { hash, issuedAt, expiresAt } = getUrlSignature(path, req);
	url.searchParams.set("ex", expiresAt);
	url.searchParams.set("is", issuedAt);
	url.searchParams.set("hm", hash);

	return url.toString();
};
