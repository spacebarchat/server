			// Auto register guest account:
			const prefix = [
				"mysterious",
				"adventurous",
				"courageous",
				"precious",
				"cynical",
				"despicable",
				"suspicious",
				"gorgeous",
				"lovely",
				"stunning",
				"based",
				"keyed",
				"ratioed",
				"twink",
				"phoned"
			];
			const suffix = [
				"Anonymous",
				"Lurker",
				"User",
				"Enjoyer",
				"Hunk",
				"Top",
				"Bottom",
				"Sub",
				"Coolstar",
				"Wrestling",
				"TylerTheCreator",
				"Ad"
			];

			Array.prototype.random = function () {
				return this[Math.floor(Math.random() * this.length)];
			};

			function _generateName() {
				return `${prefix.random()}${suffix.random()}`;
			}

			const token = JSON.parse(localStorage.getItem("token"));
			if (!token && location.pathname !== "/login" && location.pathname !== "/register") {
				fetch(`${window.GLOBAL_ENV.API_ENDPOINT}/auth/register`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ username: `${_generateName()}`, consent: true }) //${Date.now().toString().slice(-4)}
				})
					.then((x) => x.json())
					.then((x) => {
						localStorage.setItem("token", `"${x.token}"`);
						if (!window.localStorage) {
							// client already loaded -> need to reload to apply the newly registered user token
							location.reload();
						}
					});
			}
