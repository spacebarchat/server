import "dotenv/config";
import Fosscord from "fosscord-gopnik";
import Discord from "discord.js";
import mysql from "mysql2";
import fetch from "node-fetch";

const dbConn = mysql.createConnection(process.env.DATABASE as string);
const executePromise = (sql: string, args: any[]) => new Promise((resolve, reject) => dbConn.execute(sql, args, (err, res) => { if (err) reject(err); else resolve(res); }));
const savePerf = async (time: number, name: string, error?: string | Error) => {
	if (error && typeof error != "string") error = error.message;
	try {
		await executePromise("INSERT INTO performance (value, endpoint, timestamp, error) VALUES (?, ?, ?, ?)", [time ?? 0, name, new Date(), error ?? null]);
		// await executePromise("DELETE FROM performance WHERE DATE(timestamp) < now() - interval ? DAY", [process.env.RETENTION_DAYS]);
	}
	catch (e) {
		console.error(e);
	}
};

var timestamp: number | undefined;

const doMeasurements = async (channel: Discord.TextChannel) => {
	timestamp = Date.now();
	await channel.send("hello this is a special message kthxbye");

	setTimeout(doMeasurements, parseInt(process.env.MEASURE_INTERVAL as string), channel);
};

const instance = {
	app: process.env.INSTANCE_WEB_APP as string,
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

client.on("ready", async () => {
	console.log(`Ready on gateway as ${client.user!.tag}`);

	const channel = await client.channels.fetch("1019955729054267764");
	if (!channel) return;

	doMeasurements(channel as Discord.TextChannel);
});

client.on("messageCreate", async (msg: Discord.Message) => {
	if (!timestamp) return;
	if (msg.author.id != "992745947417141682"
		|| msg.channel.id != "1019955729054267764"
		|| msg.content != "hello this is a special message kthxbye")
		return;
	await savePerf(Date.now() - timestamp, "messageCreate", undefined);
	timestamp = undefined;

	await fetch(`${instance.api}/channels/1019955729054267764/messages/${msg.id}`, {
		method: "DELETE",
		headers: {
			authorization: instance.token
		}
	})
});

client.on("error", (error: any) => {
	console.log(`Gateway error`, error);
});

client.on("warn", (msg: any) => {
	console.log(`Gateway warning:`, msg);
});

(async () => {
	await new Promise((resolve) => dbConn.connect(resolve));
	console.log("Connected to db");
	await client.login(instance.token);
})();