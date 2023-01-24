/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
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

const fetch = require("node-fetch");
const fs = require("fs");
var config = require("../../config.json");
module.exports = login;
async function login(account) {
	var body = {
		fingerprint: "805826570869932034.wR8vi8lGlFBJerErO9LG5NViJFw",
		login: account.email,
		password: account.password,
	};
	var x = await fetch(config.url + "/auth/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	console.log(x);
	x = await x.json();
	console.log(x);
	return x;
}
