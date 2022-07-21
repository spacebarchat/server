import "dotenv/config";
import fetch from "node-fetch";
import Fosscord from "fosscord-gopnik";
import mysql from "mysql2";

const dbConn = mysql.createConnection(process.env.DATABASE as string);
const executePromise = (sql: string, args: any[]) => new Promise((resolve, reject) => dbConn.execute(sql, args, (err, res) => { if (err) reject(err); else resolve(res); }));

const instance = {
	api: process.env.INSTANCE_API as string,
	cdn: process.env.INSTANCE_CDN as string,
	token: process.env.INSTANCE_TOKEN as string,
};

const client = new Fosscord.Client({
	intents: [],
	http: {
		api: instance.api,
		cdn: instance.cdn
	}
});

const gatewayMeasure = async (name: string) => {
	const time = Math.max(client.ws.ping, 0);
	await savePerf(time, name, null);
	console.log(`${name} took ${time}ms`);
};

client.on("ready", () => {
	console.log(`Ready on gateway as ${client.user!.tag}`);
});

client.on("error", (error) => {
	console.log(`Gateway error`, error);
});

client.on("warn", (msg) => {
	console.log(`Gateway warning:`, msg);
});

const savePerf = async (time: number, name: string, error: string | null) => {
	try {
		await executePromise("INSERT INTO performance (value, endpoint, timestamp, error) VALUES (?, ?, ?, ?)", [time, name, new Date(), error]);
		await executePromise("DELETE FROM performance WHERE DATE(timestamp) < now() - interval ? DAY", [process.env.RETENTION_DAYS]);
	}
	catch (e) {
		console.error(e);
	}
};

const measureApi = async (name: string, path: string, body?: object) => {
	const start = Date.now();

	let error: Error | null = null;
	try {
		const res = await fetch(path, {
			headers: {
				"Content-Type": "application/json",
				"Authorization": instance.token,
			},
			body: body ? JSON.stringify(body) : undefined,
		});
		await res.json();
	}
	catch (e) {
		error = e as Error;
	}

	const time = Date.now() - start;
	console.log(`${name} took ${time}ms ${(error ? "with error" : "")}`, error ?? "");

	await savePerf(time, name, error?.message ?? null);
};

const app = async () => {
	await new Promise((resolve) => dbConn.connect(resolve));
	console.log("Connected to db");
	await client.login(instance.token);

	console.log(`Monitoring performance for instance at ${new URL(instance.api).hostname}`);

	const doMeasurements = async () => {
		await measureApi("ping", `${instance.api}/ping`);
		await measureApi("users/@me", `${instance.api}/users/@me`);
		await gatewayMeasure("websocketPing");

		setTimeout(doMeasurements, parseInt(process.env.MEASURE_INTERVAL as string));
	};

	doMeasurements();
};

app();