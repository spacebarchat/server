if (window.location.hostname !== "127.0.0.1" && window.location.hostname !== "localhost") {
	const redirectIfOnLogin = () => {
		const path = window.location.pathname;
		if (path == "/login" || path == "/register" || !localStorage.getItem("token")) {
			window.location.pathname = "/login";
			//window.location.reload();
		}
	};

	const observer = new MutationObserver((mutations) => {
		redirectIfOnLogin();
	});
	observer.observe(document, { subtree: true, childList: true });

	redirectIfOnLogin();
}