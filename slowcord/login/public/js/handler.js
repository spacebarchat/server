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

	// Very fun error message here lol
	const error =
		json.errors
			? Object.values(json.errors)[0]._errors[0].message
			: (
				json.captcha_key ? "Captcha required" : json.message
			);

	failureMessage.innerHTML = error;
	failureMessage.style.display = "block";
};