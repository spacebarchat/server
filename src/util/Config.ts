import Ajv, {JTDSchemaType} from "ajv/dist/jtd"

export interface RateLimitOptions {
	count: number;
	timespan: number;
}

export interface DefaultOptions {
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

const schema: JTDSchemaType<DefaultOptions, {rateLimitOptions: RateLimitOptions}> = {
	definitions: {
		rateLimitOptions: {
			properties: {
				count: {type: "int32"},
				timespan: {type: "int32"}
			}
		}
	},
	properties: {
		general: {
			properties: {
				instance_id: {type: "string"}
			}
		},
		permissions: {
			properties: {
				user: {
					properties: {
						createGuilds: {type: "boolean"}
					}
				}
			}
		},
		limits: {
			properties: {
				user: {
					properties: {
						maxGuilds: {type: "int32"},
						maxFriends: {type: "int32"},
						maxUsername: {type: "int32"}
					}
				},
				guild: {
					properties: {
						maxRoles: {type: "int32"},
						maxMembers: {type: "int32"},
						maxChannels: {type: "int32"},
						maxChannelsInCategory: {type: "int32"},
						hideOfflineMember: {type: "int32"}
					}
				},
				message: {
					properties: {
						characters: {type: "int32"},
						ttsCharacters: {type: "int32"},
						maxReactions: {type: "int32"},
						maxAttachmentSize: {type: "int32"},
						maxBulkDelete: {type: "int32"}
					}
				},
				channel: {
					properties: {
						maxPins: {type: "int32"},
						maxTopic: {type: "int32"},
					},
				},
				rate: {
					properties: {
						ip: {
							properties: {
								enabled: {type: "boolean"},
								count: {type: "int32"},
								timespan: {type: "int32"},
							}
						},
						routes: {
							optionalProperties: {
								auth: {
									optionalProperties: {
										login: {ref: 'rateLimitOptions'},
										register: {ref: 'rateLimitOptions'}
									}
								},
								channel: {type: "string"}
							}
						}
					}
				}
			}
		},
		security: {
			properties: {
				jwtSecret: {type: "string"},
				forwadedFor: {type: "string", nullable: true},
				captcha: {
					properties: {
						enabled: {type: "boolean"},
						service: {enum: ['hcaptcha', 'recaptcha'], nullable: true},
						sitekey: {type: "string", nullable: true},
						secret: {type: "string", nullable: true}
					}
				}
			}
		},
		login: {
			properties: {
				requireCaptcha: {type: "boolean"}
			}
		},
		register: {
			properties: {
				email: {
					properties: {
						required: {type: "boolean"},
						allowlist: {type: "boolean"},
						blocklist: {type: "boolean"},
						domains: { elements: {
							type: "string"
						}
					}
				}
			},
			dateOfBirth: {
				properties: {
					required: {type: "boolean"},
					minimum: {type: "int32"}
				}
			},
			requireCaptcha: {type: "boolean"},
			requireInvite: {type: "boolean"},
			allowNewRegistration: {type: "boolean"},
			allowMultipleAccounts: {type: "boolean"},
			password: {
				properties: {
					minLength: {type: "int32"},
					minNumbers: {type: "int32"},
					minUpperCase: {type: "int32"},
					minSymbols: {type: "int32"},
					blockInsecureCommonPasswords: {type: "boolean"}
				}
			}
		}
	}
}
}