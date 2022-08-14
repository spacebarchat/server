(this.webpackChunkdiscord_app = this.webpackChunkdiscord_app || []).push([
	[[228974]],
	{
		632540: (module, exports, req) => {
			window.find = (filter, options = {}) => {
				const { cacheOnly = false } = options;
				for (let i in req.c) {
					if (req.c.hasOwnProperty(i)) {
						let m = req.c[i].exports;
						if (m && m.__esModule && m.default && filter(m.default)) return m.default;
						if (m && filter(m)) return m;
					}
				}
				if (cacheOnly) {
					console.warn("Cannot find loaded module in cache");
					return null;
				}
				console.warn("Cannot find loaded module in cache. Loading all modules may have unexpected side effects");
				for (let i = 0; i < req.m.length; ++i) {
					let m = req(i);
					if (m && m.__esModule && m.default && filter(m.default)) return m.default;
					if (m && filter(m)) return m;
				}
				console.warn("Cannot find module");
				return null;
			};
			window.findByUniqueProperties = (propNames, options) =>
				find((module) => propNames.every((prop) => module[prop] !== undefined), options);
			window.findByDisplayName = (displayName, options) => find((module) => module.displayName === displayName, options);
			window.req = req;

			init();
		}
	},
	(t) => t(632540)
]);

function retry(callback) {
	return new Promise((resolve) => {
		const interval = setInterval(() => {
			const mod = callback();
			if (!mod) return;

			clearInterval(interval);
			resolve(mod);
		}, 50);
	});
}

async function init() {
	const SDP = await retry(() => findByUniqueProperties(["truncateSDP"]));
	const truncateSDP = SDP.truncateSDP;
	SDP.truncateSDP = (e) => {
		const result = truncateSDP(e);
		console.log("truncateSDP", result.codecs, e);
		return {
			codecs: result.codecs,
			sdp: e
		};
	};
	SDP.generateUnifiedSessionDescription = (e) => {
		return new RTCSessionDescription({ sdp: e.baseSDP, type: "answer" });
	};
}
