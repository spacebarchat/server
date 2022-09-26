const handleSubmit = async (path, body) => {
	const failureMessage = document.getElementById("failure");

	var response = await fetch(path, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});

	const json = await response.json();
	if (json.token) {
		window.localStorage.setItem("token", `"${json.token}"`);
		window.location.href = "/app";
		return;
	}

	if (json.ticket) {
		// my terrible solution to 2fa
		const twoFactorForm = document.forms["2fa"];
		const loginForm = document.forms["login"];

		twoFactorForm.style.display = "flex";
		loginForm.style.display = "none";

		twoFactorForm.ticket.value = json.ticket;
		return;
	}

	// Very fun error message here lol
	const error = json.errors
		? Object.values(json.errors)[0]._errors[0].message
		: json.captcha_key
		? "Captcha required"
		: json.message;

	failureMessage.innerHTML = error;
	failureMessage.style.display = "block";
};
