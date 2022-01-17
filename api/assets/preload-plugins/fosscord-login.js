// Remove `<link id="logincss" rel="stylesheet" href="/assets/fosscord-login.css" />` from header when we're not accessing `/login` or `/register`
// fosscord-login.css replaces discord's TOS tooltip with something more fitting for fosscord, which when included in the main app, causes other tooltips
// to be affected, which is potentially unwanted.

var token = JSON.parse(localStorage.getItem("token"));
if (!token && location.pathname !== "/login" && location.pathname !== "/register") {
	document.getElementById("logincss").remove();
}
