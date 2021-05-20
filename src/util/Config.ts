import Ajv, { JSONSchemaType } from "ajv"
import { ValidateFunction } from 'ajv'
import ajvFormats from 'ajv-formats';
import dotProp from "dot-prop";
import envPaths from "env-paths";
import path from "node:path";
import fs from 'fs'
import assert from "assert";
import atomically from "atomically"

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


const createPlainObject = <T = unknown>(): T => {
	return Object.create(null);
};
type Serialize<T> = (value: T) => string;
type Deserialize<T> = (text: string) => T;


class Config<T extends Record<string, any> = Record<string, unknown>> implements Iterable<[keyof T, T[keyof T]]> {
	readonly path: string;
	readonly #validator?: ValidateFunction;
	readonly #defaultOptions: Partial<T> = {};

	constructor() {

		const ajv = new Ajv();

		ajvFormats(ajv);

		this.#validator = ajv.compile(schema);

		const base = envPaths('fosscord').config;

		this.path = path.resolve(base, 'api.json');


		const fileStore = this.store;
		const store = Object.assign(createPlainObject<T>(), fileStore);
		this._validate(store);

		try {
			assert.deepStrictEqual(fileStore, store);
		} catch {
			this.store = store;
		}
	}

	private _validate(data: T | unknown): void {
		if (!this.#validator) {
			return;
		}

		const valid = this.#validator(data);
		if (valid || !this.#validator.errors) {
			return;
		}

		const errors = this.#validator.errors.map(({ instancePath, message = '' }) => `\`${instancePath.slice(1)}\` ${message}`);
		throw new Error('The config schema was violated!: ' + errors.join('; '));
	}

	get store(): T {
		try {
			const data = fs.readFileSync(this.path).toString();
			const deserializedData = this._deserialize(data);
			this._validate(deserializedData);
			return Object.assign(Object.create(null), deserializedData)
		} catch (error) {
			if (error.code == 'ENOENT') {
				this._ensureDirectory();
				return createPlainObject();

			}

			throw error;
		}
	}

	private _ensureDirectory(): void {
		fs.mkdirSync(path.dirname(this.path), { recursive: true })
	}

	set store(value: T) {
		this._validate(value);

		this._write(value);
	}

	private readonly _deserialize: Deserialize<T> = value => JSON.parse(value);
	private readonly _serialize: Serialize<T> = value => JSON.stringify(value, undefined, '\t')

	get<Key extends keyof T>(key: Key): T[Key];
	get<Key extends keyof T>(key: Key, defaultValue: Required<T>[Key]): Required<T>[Key];
	get<Key extends string, Value = unknown>(key: Exclude<Key, keyof T>, defaultValue?: Value): Value;
	get(key: string, defaultValue?: unknown): unknown {
		return this._get(key, defaultValue);
	}

	private _get<Key extends keyof T>(key: Key): T[Key] | undefined;
	private _get<Key extends keyof T, Default = unknown>(key: Key, defaultValue: Default): T[Key] | Default;
	private _get<Key extends keyof T, Default = unknown>(key: Key | string, defaultValue?: Default): Default | undefined {
		return dotProp.get<T[Key] | undefined>(this.store, key as string, defaultValue as T[Key]);
	}

	*[Symbol.iterator](): IterableIterator<[keyof T, T[keyof T]]> {
		for (const [key, value] of Object.entries(this.store)) {
			yield [key, value];
		}
	}

	private _write(value: T): void {
		let data: string | Buffer = this._serialize(value);

		try {
			atomically.writeFileSync(this.path, data);
		} catch (error) {
			if (error.code == 'EXDEV') {
				fs.writeFileSync(this.path, data)
				return
			}

			throw error;
		}
	}
}

export const apiConfig = new Config();