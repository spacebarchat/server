// Remove `<link id="logincss" rel="stylesheet" href="/assets/fosscord-login.css" />` from header when we're not accessing `/login` or `/register`
// fosscord-login.css replaces discord's TOS tooltip with something more fitting for fosscord, which when included in the main app, causes other tooltips
// to be affected, which is potentially unwanted.
//
// This script removes fosscord-login.css when a user reloads the page. From testing, it appears fosscord already properly removes
// fosscord-login.css after login is successful, but not if you reload the page after logging in. This script is to remove fosscord-login.css in
// that specific case.

let token = JSON.parse(localStorage.getItem("token"));
if (!token && location.pathname !== "/login" && location.pathname !== "/register") {
	document.getElementById("logincss").remove();
}
