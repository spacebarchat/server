require("dotenv").config();
const fetch = require("node-fetch");
const count = Number(process.env.COUNT) || 50;
const endpoint = process.env.API || "http://localhost:3001";

async function main() {
	for (let i = 0; i < count; i++) {
		fetch(`${endpoint}/api/auth/register`, {
			method: "POST",
			body: JSON.stringify({
				fingerprint: `${i}.wR8vi8lGlFBJerErO9LG5NViJFw`,
				username: `test${i}`,
				invite: null,
				consent: true,
				date_of_birth: "2000-01-01",
				gift_code_sku_id: null,
				captcha_key: null,
			}),
			headers: { "content-type": "application/json" },
		});
		console.log(i);
	}
}

main();
