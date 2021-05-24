import { Schema, model, Types, Document } from "mongoose";
import "missing-native-js-functions";
import db, { MongooseCache } from "./Database";
import { Snowflake } from "./Snowflake";
import crypto from "crypto";

var Config = new MongooseCache(db.collection("config"), [], { onlyEvents: false });

export default {
	init: async function init(defaultOpts: any = DefaultOptions) {
		await Config.init();
		return this.set(Config.data.merge(defaultOpts));
	},
	get: function get() {
		return <DefaultOptions>Config.data;
	},
	set: function set(val: any) {
		return db.collection("config").updateOne({}, { $set: val }, { upsert: true });
	},
};

export interface RateLimitOptions {
	count: number;
	timespan: number;
}

export interface DefaultOptions {
	gateway: {
		endpoint: string;
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
			maxCharacters: number;
			maxTTSCharacters: number;
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
				// TODO: rate limit configuration for all routes
			};
		};
	};
	security: {
		jwtSecret: string;
		forwadedFor: string | null; // header to get the real user ip address
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
			necessary: boolean;
			allowlist: boolean;
			blocklist: boolean;
			domains: string[];
		};
		dateOfBirth: {
			necessary: boolean;
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
		};
	};
}

export const DefaultOptions: DefaultOptions = {
	gateway: {
		endpoint: "ws://localhost:3001",
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
			maxCharacters: 2000,
			maxTTSCharacters: 200,
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
			necessary: true,
			allowlist: false,
			blocklist: true,
			domains: [], // TODO: efficiently save domain blocklist in database
			// domains: fs.readFileSync(__dirname + "/blockedEmailDomains.txt", { encoding: "utf8" }).split("\n"),
		},
		dateOfBirth: {
			necessary: true,
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
		},
	},
};

export const ConfigSchema = new Schema(Object);

export interface DefaultOptionsDocument extends DefaultOptions, Document {}

export const ConfigModel = model<DefaultOptionsDocument>("Config", ConfigSchema, "config");
