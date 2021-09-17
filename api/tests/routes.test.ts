// TODO: check every route based on route() parameters: https://github.com/fosscord/fosscord-server/issues/308
// TODO: check every route with different database engine

import getRouteDescriptions from "../jest/getRouteDescriptions";
import supertest, { Response } from "supertest";
import path from "path";
import fs from "fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";
const request = supertest("http://localhost:3001/api");

const SchemaPath = path.join(__dirname, "..", "assets", "responses.json");
const schemas = JSON.parse(fs.readFileSync(SchemaPath, { encoding: "utf8" }));
export const ajv = new Ajv({
	allErrors: true,
	parseDate: true,
	allowDate: true,
	schemas,
	messages: true,
	strict: true,
	strictRequired: true
});
addFormats(ajv);

describe("Automatic unit tests with route description middleware", () => {
	const routes = getRouteDescriptions();

	routes.forEach((route, pathAndMethod) => {
		const [path, method] = pathAndMethod.split("|");
		test(path, (done) => {
			if (!route.example) {
				console.log(`Route ${path} is missing the example property`);
				return done();
			}
			if (!route.response) {
				console.log(`Route ${path} is missing the response property`);
				return done();
			}
			const urlPath = path || route.example?.path;
			const validate = ajv.getSchema(route.response.body);
			if (!validate) return done(new Error(`Response schema ${route.response.body} not found`));

			request[method](urlPath)
				.expect(route.response.status)
				.expect((err: any, res: Response) => {
					if (err) return done(err);
					const valid = validate(res.body);
					if (!valid) return done(validate.errors);

					return done();
				});
		});
	});
});
