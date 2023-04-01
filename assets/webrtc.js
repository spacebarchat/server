/*
	This file is used to patch client version 134842 ( and probably a lot more ) to send additional info when using webrtc.
	If you want to use it, throw it into the `preload-plugins` folder.
	TODO: Make it so this file is not required for webrtc.
	
	Do note that webrtc, as of 17/12/2022, is not implemented yet in spacebarchat/server.
*/

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
	const StringManipulator = findByUniqueProperties(["uniq"]);

	const truncateSDP = SDP.truncateSDP;
	SDP.truncateSDP = (e) => {
		const result = truncateSDP(e);
		const i = result.codecs.find((x) => x.name === "VP8");
		const a = new RegExp("^a=ice|a=extmap|opus|VP8|fingerprint|" + i?.rtxPayloadType + " rtx", "i");
		return {
			sdp: StringManipulator(e)
				.split(/\r\n/)
				.filter(function (e) {
					return a.test(e);
				})
				.uniq()
				.join("\n"),
			codecs: result.codecs
		};
	};
	// SDP.generateUnifiedSessionDescription = (e) => {
	// 	console.log(e);
	// 	return new RTCSessionDescription({ sdp: e.baseSDP.replace(/sendonly/g, "recvonly"), type: "answer" });
	// };
}