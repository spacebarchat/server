import Ajv, { JSONSchemaType } from "ajv"
import { getConfigPathForFile } from "@fosscord/server-util/dist/util/Config";
import {Config} from "@fosscord/server-util"

export interface RateLimitOptions {
	count: number;
	timespan: number;
}

export interface DefaultOptions {
	gateway: string;
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
				channel?: string;
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
			blockInsecureCommonPasswords: boolean; // TODO: efficiently save password blocklist in database
		};
	};
}


const schema: JSONSchemaType<DefaultOptions> & {
	definitions: {
		rateLimitOptions: JSONSchemaType<RateLimitOptions>
	}
} = {
	type: "object",
	definitions: {
		rateLimitOptions: {
			type: "object",
			properties: {
				count: { type: "number" },
				timespan: { type: "number" },
			},
			required: ["count", "timespan"],
		},
	},
	properties: {
		gateway: {
			type: "string"
		},
		general: {
			type: "object",
			properties: {
				instance_id: {
					type: "string"
				}
			},
			required: ["instance_id"],
			additionalProperties: false
		},
		permissions: {
			type: "object",
			properties: {
				user: {
					type: "object",
					properties: {
						createGuilds: {
							type: "boolean"
						}
					},
					required: ["createGuilds"],
					additionalProperties: false
				}
			},
			required: ["user"],
			additionalProperties: false
		},
		limits: {
			type: "object",
			properties: {
				user: {
					type: "object",
					properties: {
						maxFriends: {
							type: "number"
						},
						maxGuilds: {
							type: "number"
						},
						maxUsername: {
							type: "number"
						}
					},
					required: ["maxFriends", "maxGuilds", "maxUsername"],
					additionalProperties: false
				},
				guild: {
					type: "object",
					properties: {
						maxRoles: {
							type: "number"
						},
						maxMembers: {
							type: "number"
						},
						maxChannels: {
							type: "number"
						},
						maxChannelsInCategory: {
							type: "number"
						},
						hideOfflineMember: {
							type: "number"
						}
					},
					required: ["maxRoles", "maxMembers", "maxChannels", "maxChannelsInCategory", "hideOfflineMember"],
					additionalProperties: false
				},
				message: {
					type: "object",
					properties: {
						characters: {
							type: "number"
						},
						ttsCharacters: {
							type: "number"
						},
						maxReactions: {
							type: "number"
						},
						maxAttachmentSize: {
							type: "number"
						},
						maxBulkDelete: {
							type: "number"
						}
					},
					required: ["characters", "ttsCharacters", "maxReactions", "maxAttachmentSize", "maxBulkDelete"],
					additionalProperties: false
				},
				channel: {
					type: "object",
					properties: {
						maxPins: {
							type: "number"
						},
						maxTopic: {
							type: "number"
						}
					},
					required: ["maxPins", "maxTopic"],
					additionalProperties: false
				},
				rate: {
					type: "object",
					properties: {
						ip: {
							type: "object",
							properties: {
								enabled: { type: "boolean" },
								count: { type: "number" },
								timespan: { type: "number" }
							},
							required: ["enabled", "count", "timespan"],
							additionalProperties: false
						},
						routes: {
							type: "object",
							properties: {
								auth: {
									type: "object",
									properties: {
										login: { $ref: '#/definitions/rateLimitOptions' },
										register: { $ref: '#/definitions/rateLimitOptions' }
									},
									nullable: true,
									required: [],
									additionalProperties: false
								},
								channel: {
									type: "string",
									nullable: true
								}
							},
							required: [],
							additionalProperties: false
						}
					},
					required: ["ip", "routes"]
				}
			},
			required: ["channel", "guild", "message", "rate", "user"],
			additionalProperties: false
		},
		security: {
			type: "object",
			properties: {
				jwtSecret: {
					type: "string"
				},
				forwadedFor: {
					type: "string",
					nullable: true
				},
				captcha: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						service: {
							type: "string",
							enum: ["hcaptcha", "recaptcha", null],
							nullable: true
						},
						sitekey: {
							type: "string",
							nullable: true
						},
						secret: {
							type: "string",
							nullable: true
						}
					},
					required: ["enabled", "secret", "service", "sitekey"],
					additionalProperties: false
				}
			},
			required: ["captcha", "forwadedFor", "jwtSecret"],
			additionalProperties: false
		},
		login: {
			type: "object",
			properties: {
				requireCaptcha: { type: "boolean" }
			},
			required: ["requireCaptcha"],
			additionalProperties: false
		},
		register: {
			type: "object",
			properties: {
				email: {
					type: "object",
					properties: {
						necessary: { type: "boolean" },
						allowlist: { type: "boolean" },
						blocklist: { type: "boolean" },
						domains: {
							type: "array",
							items: {
								type: "string"
							}
						}
					},
					required: ["allowlist", "blocklist", "domains", "necessary"],
					additionalProperties: false
				},
				dateOfBirth: {
					type: "object",
					properties: {
						necessary: { type: "boolean" },
						minimum: { type: "number" }
					},
					required: ["minimum", "necessary"],
					additionalProperties: false
				},
				requireCaptcha: { type: "boolean" },
				requireInvite: { type: "boolean" },
				allowNewRegistration: { type: "boolean" },
				allowMultipleAccounts: { type: "boolean" },
				password: {
					type: "object",
					properties: {
						minLength: { type: "number" },
						minNumbers: { type: "number" },
						minUpperCase: { type: "number" },
						minSymbols: { type: "number" },
						blockInsecureCommonPasswords: { type: "boolean" }
					},
					required: ["minLength", "minNumbers", "minUpperCase", "minSymbols", "blockInsecureCommonPasswords"],
					additionalProperties: false
				}
			},
			required: ["allowMultipleAccounts", "allowNewRegistration", "dateOfBirth", "email", "password", "requireCaptcha", "requireInvite"],
			additionalProperties: false
		},
	},
	required: ["gateway", "general", "limits", "login", "permissions", "register", "security"],
	additionalProperties: false
}


const ajv = new Ajv();
const validator = ajv.compile(schema);

const configPath = getConfigPathForFile("fosscord", "api", ".json");

export const apiConfig = new Config<DefaultOptions>({path: configPath, schemaValidator: validator, schema: schema});