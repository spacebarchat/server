import { Config, Snowflake } from "@fosscord/server-util";
import crypto from "crypto";

export default {
	init() {
		return Config.init({ api: DefaultOptions });
	},
	get(): DefaultOptions {
		return Config.getAll().api;
	},
	set(val: any) {
		return Config.setAll({ api: val });
	},
	getAll: Config.getAll,
	setAll: Config.setAll,
};

export interface RateLimitOptions {
	count: number;
	timespan: number;
}

export interface DefaultOptions {
	server: {
		root_url: string;
	};
	general: {
		instance_id: string;
	};
	permissions: {
		user: {
			createGuilds: boolean;
		};
	};
	limits: {
		user: {
			maxGuilds: number;
			maxUsername: number;
			maxFriends: number;
		};
		guild: {
			maxRoles: number;
			maxMembers: number;
			maxChannels: number;
			maxChannelsInCategory: number;
			hideOfflineMember: number;
		};
		message: {
			characters: number;
			ttsCharacters: number;
			maxReactions: number;
			maxAttachmentSize: number;
			maxBulkDelete: number;
		};
		channel: {
			maxPins: number;
			maxTopic: number;
		};
		rate: {
			ip: {
				enabled: boolean;
				count: number;
				timespan: number;
			};
			routes: {
				auth?: {
					login?: RateLimitOptions;
					register?: RateLimitOptions;
				};
				channel?: {};
				// TODO: rate limit configuration for all routes
			};
		};
	};
	security: {
		jwtSecret: string;
		forwadedFor: string | null;
		captcha: {
			enabled: boolean;
			service: "recaptcha" | "hcaptcha" | null; // TODO: hcaptcha, custom
			sitekey: string | null;
			secret: string | null;
		};
	};
	login: {
		requireCaptcha: boolean;
	};
	register: {
		email: {
			required: boolean;
			allowlist: boolean;
			blocklist: boolean;
			domains: string[];
		};
		dateOfBirth: {
			required: boolean;
			minimum: number; // in years
		};
		requireCaptcha: boolean;
		requireInvite: boolean;
		allowNewRegistration: boolean;
		allowMultipleAccounts: boolean;
		password: {
			minLength: number;
			minNumbers: number;
			minUpperCase: number;
			minSymbols: number;
			blockInsecureCommonPasswords: boolean; // TODO: efficiently save password blocklist in database
		};
	};
}

export const DefaultOptions: DefaultOptions = {
	server: {
		root_url: "localhost" // we are localhost unless the oposite is specified
	},
	general: {
		instance_id: Snowflake.generate(),
	},
	permissions: {
		user: {
			createGuilds: true,
		},
	},
	limits: {
		user: {
			maxGuilds: 100,
			maxUsername: 32,
			maxFriends: 1000,
		},
		guild: {
			maxRoles: 250,
			maxMembers: 250000,
			maxChannels: 500,
			maxChannelsInCategory: 50,
			hideOfflineMember: 1000,
		},
		message: {
			characters: 2000,
			ttsCharacters: 200,
			maxReactions: 20,
			maxAttachmentSize: 8388608,
			maxBulkDelete: 100,
		},
		channel: {
			maxPins: 50,
			maxTopic: 1024,
		},
		rate: {
			ip: {
				enabled: true,
				count: 1000,
				timespan: 1000 * 60 * 10,
			},
			routes: {},
		},
	},
	security: {
		jwtSecret: crypto.randomBytes(256).toString("base64"),
		forwadedFor: null,
		// forwadedFor: "X-Forwarded-For" // nginx/reverse proxy
		// forwadedFor: "CF-Connecting-IP" // cloudflare:
		captcha: {
			enabled: false,
			service: null,
			sitekey: null,
			secret: null,
		},
	},
	login: {
		requireCaptcha: false,
	},
	register: {
		email: {
			required: true,
			allowlist: false,
			blocklist: true,
			domains: [], // TODO: efficiently save domain blocklist in database
			// domains: fs.readFileSync(__dirname + "/blockedEmailDomains.txt", { encoding: "utf8" }).split("\n"),
		},
		dateOfBirth: {
			required: true,
			minimum: 13,
		},
		requireInvite: false,
		requireCaptcha: true,
		allowNewRegistration: true,
		allowMultipleAccounts: true,
		password: {
			minLength: 8,
			minNumbers: 2,
			minUpperCase: 2,
			minSymbols: 0,
			blockInsecureCommonPasswords: false,
		},
	},
};
