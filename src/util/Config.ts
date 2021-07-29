import { Schema, model, Types, Document } from "mongoose";
import "missing-native-js-functions";
import db, { MongooseCache } from "./Database";
import { Snowflake } from "./Snowflake";
import crypto from "crypto";

var Config = new MongooseCache(db.collection("config"), [], { onlyEvents: false, array: false });

export default {
	init: async function init(defaultOpts: any = DefaultOptions) {
		await Config.init();
		return this.set((Config.data || {}).merge(defaultOpts));
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

export interface Region {
	id: string,
	name: string,
	vip: boolean,
	custom: boolean,
	deprecated: boolean,
	optimal: boolean,
}

export interface KafkaBroker {
	ip: string,
	port: number
}

export interface DefaultOptions {
	gateway: {
		endpoint: string | null;
	};
	cdn: {
		endpoint: string | null;
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
		requestSignature: string;
		jwtSecret: string;
		forwadedFor: string | null; // header to get the real user ip address
		captcha: {
			enabled: boolean;
			service: "recaptcha" | "hcaptcha" | null; // TODO: hcaptcha, custom
			sitekey: string | null;
			secret: string | null;
		};
		ipdataApiKey: string | null;
	};
	login: {
		requireCaptcha: boolean;
	};
	register: {
		email: {
			necessary: boolean; // we have to use necessary instead of required as the cli tool uses json schema and can't use required
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
		blockProxies: boolean;
		password: {
			minLength: number;
			minNumbers: number;
			minUpperCase: number;
			minSymbols: number;
		};
	};
	regions: {
		default: string;
		available: Region[];
	}
	kafka: {
		brokers: KafkaBroker[]
	}
}

export const DefaultOptions: DefaultOptions = {
	gateway: {
		endpoint: null,
	},
	cdn: {
		endpoint: null,
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
		requestSignature: crypto.randomBytes(32).toString("base64"),
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
		ipdataApiKey: "eca677b284b3bac29eb72f5e496aa9047f26543605efe99ff2ce35c9",
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
		blockProxies: true,
		password: {
			minLength: 8,
			minNumbers: 2,
			minUpperCase: 2,
			minSymbols: 0,
		},
	},
	regions: {
		default: "fosscord",
		available: [
			{ id: "fosscord", name: "Fosscord", vip: false, custom: false, deprecated: false, optimal: false },
		]
	},
	kafka: {
		brokers: [
			{ ip: "localhost", port: 9092 }
		]
	}
};

export const ConfigSchema = new Schema({}, { strict: false });

export interface DefaultOptionsDocument extends DefaultOptions, Document { }

export const ConfigModel = model<DefaultOptionsDocument>("Config", ConfigSchema, "config");
