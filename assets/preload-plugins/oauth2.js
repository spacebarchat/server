// Fixes /oauth2 endpoints not requesting a CSS file

if (location.pathname.startsWith("/oauth2/")) {
	const link = document.createElement("link");
	link.rel = "stylesheet"
	link.type = "text/css"
	link.href = "/assets/40532.f7b1e10347ef10e790ac.css"
	document.head.appendChild(link)
}