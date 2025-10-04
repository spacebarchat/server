import moduleAlias from "module-alias";
moduleAlias();
import './Url';
import {  describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe("URL extensions", () => {

	it("normalize", async () => {
		const tests: [string, string][] = [
			["http://example.com", "http://example.com/"],
			["http://example.com/", "http://example.com/"],
			["http://example.com/path/", "http://example.com/path"],
			["http://example.com/path//", "http://example.com/path/"],
			["http://example.com/path?b=2&a=1", "http://example.com/path?a=1&b=2"],
			["http://example.com/path?b=2&a=1&", "http://example.com/path?a=1&b=2"],
			["http://example.com/path?", "http://example.com/path"],
			["http://example.com/path#fragment", "http://example.com/path"],
			["http://example.com/path/?b=2&a=1#fragment", "http://example.com/path?a=1&b=2"],
			["ftp://example.com/resource/", "ftp://example.com/resource"],
			["https://example.com/resource?z=3&y=2&x=1", "https://example.com/resource?x=1&y=2&z=3"],
			["https://example.com/resource?z=3&y=2&x=1#", "https://example.com/resource?x=1&y=2&z=3"],
			["https://example.com/resource?z=3&y=2&x=1#section", "https://example.com/resource?x=1&y=2&z=3"],
			["https://example.com/resource/?z=3&y=2&x=1#section", "https://example.com/resource?x=1&y=2&z=3"],
			["https://example.com/resource//?z=3&y=2&x=1#section", "https://example.com/resource/?x=1&y=2&z=3"],
			["https://example.com/", "https://example.com/"],
			["https://example.com", "https://example.com/"],
		];
		for (const [input, expected] of tests) {
			assert.doesNotThrow(() => new URL(input), `URL("${input}") should not throw`);
			const url = new URL(input);
			const normalized = url.normalize();
			assert.strictEqual(normalized, expected, `normalize("${input}") = "${normalized}", expected "${expected}"`);
		}
	});

});