import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseClass } from "./BaseClass";
import crypto from "crypto";
import { Snowflake } from "../util/Snowflake";

@Entity("config")
export class ConfigEntity extends BaseClass {
	@Column({ type: "simple-json" })
	value: ConfigValue;
}

export interface RateLimitOptions {
	bot?: number;
	count: number;
	window: number;
	onyIp?: boolean;
}

export interface Region {
	id: string;
	name: string;
	endpoint: string;
	location?: {
		latitude: number;
		longitude: number;
	};
	vip: boolean;
	custom: boolean;
	deprecated: boolean;
}

export interface KafkaBroker {
	ip: string;
	port: number;
}

export interface ConfigValue {
	gateway: {
		endpointClient: string | null;
		endpoint: string | null;
	};
	cdn: {
		endpointClient: string | null;
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
			maxWebhooks: number;
		};
		rate: {
			disabled: boolean;
			ip: Omit<RateLimitOptions, "bot_count">;
			global: RateLimitOptions;
			error: RateLimitOptions;
			routes: {
				guild: RateLimitOptions;
				webhook: RateLimitOptions;
				channel: RateLimitOptions;
				auth: {
					login: RateLimitOptions;
					register: RateLimitOptions;
				};
				// TODO: rate limit configuration for all routes
			};
		};
	};
	security: {
		autoUpdate: boolean | number;
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
		blockProxies: boolean;
		password: {
			required: boolean;
			minLength: number;
			minNumbers: number;
			minUpperCase: number;
			minSymbols: number;
		};
	};
	regions: {
		default: string;
		useDefaultAsOptimal: boolean;
		available: Region[];
	};
	rabbitmq: {
		host: string | null;
	};
	kafka: {
		brokers: KafkaBroker[] | null;
	};
}

export const DefaultConfigOptions: ConfigValue = {
	gateway: {
		endpointClient: null,
		endpoint: null,
	},
	cdn: {
		endpointClient: null,
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
			maxWebhooks: 10,
		},
		rate: {
			disabled: true,
			ip: {
				count: 500,
				window: 5,
			},
			global: {
				count: 20,
				window: 5,
				bot: 250,
			},
			error: {
				count: 10,
				window: 5,
			},
			routes: {
				guild: {
					count: 5,
					window: 5,
				},
				webhook: {
					count: 10,
					window: 5,
				},
				channel: {
					count: 10,
					window: 5,
				},
				auth: {
					login: {
						count: 5,
						window: 60,
					},
					register: {
						count: 2,
						window: 60 * 60 * 12,
					},
				},
			},
		},
	},
	security: {
		autoUpdate: true,
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
			required: false,
			allowlist: false,
			blocklist: true,
			domains: [], // TODO: efficiently save domain blocklist in database
			// domains: fs.readFileSync(__dirname + "/blockedEmailDomains.txt", { encoding: "utf8" }).split("\n"),
		},
		dateOfBirth: {
			required: false,
			minimum: 13,
		},
		requireInvite: false,
		requireCaptcha: true,
		allowNewRegistration: true,
		allowMultipleAccounts: true,
		blockProxies: true,
		password: {
			required: false,
			minLength: 8,
			minNumbers: 2,
			minUpperCase: 2,
			minSymbols: 0,
		},
	},
	regions: {
		default: "fosscord",
		useDefaultAsOptimal: true,
		available: [
			{
				id: "fosscord",
				name: "Fosscord",
				endpoint: "127.0.0.1:3004",
				vip: false,
				custom: false,
				deprecated: false,
			},
		],
	},
	rabbitmq: {
		host: null,
	},
	kafka: {
		brokers: null,
	},
};
