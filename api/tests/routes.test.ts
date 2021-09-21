// TODO: check every route based on route() parameters: https://github.com/fosscord/fosscord-server/issues/308
// TODO: check every route with different database engine

import getRouteDescriptions from "../jest/getRouteDescriptions";
import { join } from "path";
import fs from "fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import fetch from "node-fetch";
import { Event, User, events } from "@fosscord/util";

const SchemaPath = join(__dirname, "..", "assets", "schemas.json");
const schemas = JSON.parse(fs.readFileSync(SchemaPath, { encoding: "utf8" }));
export const ajv = new Ajv({
	allErrors: true,
	parseDate: true,
	allowDate: true,
	schemas,
	messages: true,
	strict: true,
	strictRequired: true,
	coerceTypes: true
});
addFormats(ajv);

var token: string;
var user: User;
beforeAll(async (done) => {
	try {
		const response = await fetch("http://localhost:3001/api/auth/register", {
			method: "POST",
			body: JSON.stringify({
				fingerprint: "805826570869932034.wR8vi8lGlFBJerErO9LG5NViJFw",
				email: "test@example.com",
				username: "tester",
				password: "wtp9gep9gw",
				invite: null,
				consent: true,
				date_of_birth: "2000-01-01",
				gift_code_sku_id: null,
				captcha_key: null
			}),
			headers: {
				"content-type": "application/json"
			}
		});
		const json = await response.json();
		token = json.token;
		user = await (
			await fetch(`http://localhost:3001/api/users/@me`, {
				headers: { authorization: token }
			})
		).json();

		done();
	} catch (error) {
		done(error);
	}
});

const emit = events.emit;
events.emit = (event: string | symbol, ...args: any[]) => {
	events.emit("event", args[0]);
	return emit(event, ...args);
};

describe("Automatic unit tests with route description middleware", () => {
	const routes = getRouteDescriptions();

	routes.forEach((route, pathAndMethod) => {
		const [path, method] = pathAndMethod.split("|");

		test(`${method.toUpperCase()} ${path}`, async (done) => {
			if (!route.test) {
				console.log(`${(route as any).file}\nrouter.${method} is missing the test property`);
				return done();
			}
			const urlPath = path.replace(":id", user.id) || route.test?.path;
			var validate: any;
			if (route.test.body) {
				validate = ajv.getSchema(route.test.body);
				if (!validate) return done(new Error(`Response schema ${route.test.body} not found`));
			}

			var body = "";
			let eventEmitted = Promise.resolve();

			if (route.test.event) {
				if (!Array.isArray(route.test.event)) route.test.event = [route.test.event];

				eventEmitted = new Promise((resolve, reject) => {
					const timeout = setTimeout(() => reject, 1000);
					const received = [];

					events.on("event", (event: Event) => {
						if (!route.test.event.includes(event.event)) return;

						received.push(event.event);
						if (received.length === route.test.event.length) resolve();
					});
				});
			}

			try {
				const response = await fetch(`http://localhost:3001/api${urlPath}`, {
					method: method.toUpperCase(),
					body: JSON.stringify(route.test.body),
					headers: { ...route.test.headers, authorization: token }
				});

				body = await response.text();

				expect(response.status, body).toBe(route.test.response.status || 200);

				// TODO: check headers
				// TODO: expect event

				if (validate) {
					body = JSON.parse(body);
					const valid = validate(body);
					if (!valid) return done(validate.errors);
				}
			} catch (error) {
				return done(error);
			}

			try {
				await eventEmitted;
			} catch (error) {
				return done(new Error(`Event ${route.test.event} was not emitted`));
			}

			return done();
		});
	});
});
