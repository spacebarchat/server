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

/* eslint-env node */

const fetch = require("node-fetch");
const fs = require("fs");
var config = require("../../config.json");
module.exports = generate;
async function generate() {
	var mail = (Math.random() + 10).toString(36).substring(2);
	mail =
		mail +
		"." +
		(Math.random() + 10).toString(36).substring(2) +
		"@stresstest.com";
	var password =
		(Math.random() * 69).toString(36).substring(-7) +
		(Math.random() * 69).toString(36).substring(-7) +
		(Math.random() * 69).toString(36).substring(-8);
	console.log(mail);
	console.log(password);
	var body = {
		fingerprint: "805826570869932034.wR8vi8lGlFBJerErO9LG5NViJFw",
		email: mail,
		username: "Spacebar Stress Test",
		password: password,
		invite: config.invite,
		consent: true,
		date_of_birth: "2000-04-04",
		gift_code_sku_id: null,
		captcha_key: null,
	};
	var x = await fetch(config.url + "/auth/register", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	console.log(x);
	x = await x.json();
	console.log(x);
	return { email: mail, password: password };
}
