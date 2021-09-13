const supertest = require("supertest");
const request = supertest("http://localhost:3001");

describe("/api/auth/register", () => {
	describe("POST", () => {
		test("without body", async () => {
			const response = await request.post("/api/auth/register").send({});

			expect(response.statusCode).toBe(400);
		});
		test("with body", async () => {
			const response = await request.post("/api/auth/register").send({
				fingerprint: "805826570869932034.wR8vi8lGlFBJerErO9LG5NViJFw",
				email: "qo8etzvaf@gmail.com",
				username: "qp39gr98",
				password: "wtp9gep9gw",
				invite: null,
				consent: true,
				date_of_birth: "2000-04-04",
				gift_code_sku_id: null,
				captcha_key: null
			});

			expect(response.statusCode).toBe(200);
		});
	});
});
