// @ts-nocheck
import "missing-native-js-functions";
import { config } from "dotenv";
config();
import { DiscordServer } from "../Server";
import fetch from "node-fetch";
import { promises } from "fs";
const count = 100;

async function main() {
	const server = new DiscordServer({ port: 3000 });
	await server.start();

	const tasks = [];
	for (let i = 0; i < count; i++) {
		tasks.push(test());
	}

	await Promise.all(tasks);

	console.log("logging in 5secs");
	setTimeout(async () => {
		await test();

		process.exit();
	}, 5000);
}
main();

async function test() {
	const res = await fetch("http://localhost:3000/api/v8/guilds/813524615463698433/members/813524464300982272", {
		headers: {
			authorization:
				"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgxMzUyNDQ2NDMwMDk4MjI3MiIsImlhdCI6MTYxNDAyOTc0Nn0.6WQiU4D5HHRi3sliHOQe1hsW-hZTEttvdtZuNIdviNI",
		},
	});

	return await res.text();
}
