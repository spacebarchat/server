const nodeFetch = require("node-fetch");

const fetch = (url, opts) =>
	nodeFetch(url, {
		...opts,
		headers: {
			Accept: "application/activity+json",
			...(opts?.headers || {}),
		},
	}).then((x) => x.json());

const webfinger = async (domain, user) => {
	const query = `https://${domain}/.well-known/webfinger?resource=@${user}@${domain}`;
	const json = await fetch(query);
	return json.links.find((x) => x.rel == "self").href;
};

(async () => {
	const userLocation = await webfinger(
		"chat.understars.dev",
		"1140599542186631381",
	);
	console.log(userLocation);

	const user = await fetch(userLocation);

	const outbox = await fetch(user.outbox);

	const firstPage = await fetch(outbox.first);

	const mostRecent = firstPage.orderedItems[0];

	console.log(mostRecent);
})();
