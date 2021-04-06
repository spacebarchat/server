import { getPermission } from "fosscord-server-util";

async function main() {
	const t = await getPermission("811642917432066048", "812327318532915201");
	console.log(t);
}

main();
