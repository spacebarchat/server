const redirectIfOnLogin = () => {
	const path = window.location.pathname;
	if (path == "/login" || path == "/register") {
		window.location.reload();
	}
}

const observer = new MutationObserver((mutations) => {
	redirectIfOnLogin();
});
observer.observe(document, { subtree: true, childList: true })

redirectIfOnLogin();