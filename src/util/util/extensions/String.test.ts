import moduleAlias from "module-alias";
moduleAlias();
import './String';
import {  describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe("String extensions", () => {

	it("globToRegexp", () => {
		const pattern = "file-*.txt";
		const regex = pattern.globToRegexp();
		assert.ok(regex.test("file-123.txt"));
	});

});