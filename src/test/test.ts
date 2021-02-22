import { getPermission } from "fosscord-server-util";

async function main() {
	const t = await getPermission(811642917432066048n, 812327318532915201n);
	console.log(t);
}

main();
