const supertest = require("supertest");
const request = supertest("http://localhost:3001");

describe("/api/auth/login", () => {
	describe("POST", () => {
		test("without body", async () => {
			const response = await request.post("/api/auth/login").send({});
			expect(response.statusCode).toBe(400);
		});
		test("with body", async () => {
			const user = {
				login: "fortnitefortnite@gmail.com",
				password: "verysecurepassword"
			};

			await request.post("/api/auth/register").send({
				fingerprint: "805826570869932034.wR8vi8lGlFBJerErO9LG5NViJFw",
				email: user.login,
				username: user.login.split("@")[0],
				password: user.password,
				invite: null,
				consent: true,
				date_of_birth: "2000-04-04",
				gift_code_sku_id: null,
				captcha_key: null
			});

			const response = await request.post("/api/auth/login").send(user);

			expect(response.statusCode).toBe(200);
		});
	});
});
