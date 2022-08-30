const path = require("path");
const fs = require("fs");
const { env } = require("process");
const { execSync } = require("child_process");
const { argv, stdout, exit } = require("process");

const { execIn, getLines, parts } = require("./utils");

let lines = fs.readFileSync(path.join(__dirname, "..", "src", "util", "util", "Rights.ts")).toString();
let lines2 = lines.split("\n");
let lines3 = lines2.filter((y) => y.includes(": BitFlag("));
let lines4 = lines3.map((x) => x.split("//")[0].trim());

function BitFlag(int) {
	return 1n << BigInt(int);
}

let rights = [];
let maxRights = 0n;
lines4.forEach((x) => {
	maxRights += eval(`rights.${x.replace(":", " = ").replace(",", ";")}`);
});
//max rights...
console.log(`Maximum rights: ${maxRights}`);
//discord rights...
discordRights = maxRights;
discordRights -= rights.SEND_BACKDATED_EVENTS;
discordRights -= rights.MANAGE_GUILD_DIRECTORY;
discordRights -= rights.CREDITABLE;
discordRights -= rights.BYPASS_RATE_LIMITS;
discordRights -= rights.ADD_MEMBERS;
discordRights -= rights.MANAGE_RATE_LIMITS;
discordRights -= rights.OPERATOR;
console.log(`Discord-like rights: ${discordRights}`);
