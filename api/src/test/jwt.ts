const jwa = require("jwa");

var STR64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split("");

function base64url(string: string, encoding: string) {
	// @ts-ignore
	return Buffer.from(string, encoding).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function to64String(input: number, current = ""): string {
	if (input < 0 && current.length == 0) {
		input = input * -1;
	}
	var modify = input % 64;
	var remain = Math.floor(input / 64);
	var result = STR64[modify] + current;
	return remain <= 0 ? result : to64String(remain, result);
}

function to64Parse(input: string) {
	var result = 0;
	var toProc = input.split("");
	var e;
	for (e in toProc) {
		result = result * 64 + STR64.indexOf(toProc[e]);
	}
	return result;
}

// @ts-ignore
const start = `${base64url("311129357362135041")}.${to64String(Date.now())}`;
const signature = jwa("HS256").sign(start, `test`);
const token = `${start}.${signature}`;
console.log(token);

// MzExMTI5MzU3MzYyMTM1MDQx.XdQb_rA.907VgF60kocnOTl32MSUWGSSzbAytQ0jbt36KjLaxuY
// MzExMTI5MzU3MzYyMTM1MDQx.XdQbaPy.4vGx4L7IuFJGsRe6IL3BeybLIvbx4Vauvx12pwNsy2U
