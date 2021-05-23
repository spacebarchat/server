const { Snowflake } = require("@fosscord/server-util");
const crypto = require('crypto');
const fs = require('fs');


const defaultConfig = {
    // TODO: Get the network interfaces dinamically
    gateway: "ws://localhost",
    general: {
        instance_id: Snowflake.generate(),
    },
    permissions: {
        user: {
            createGuilds: true,
        }
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
			routes: "",
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
}

let data = JSON.stringify(defaultConfig);
fs.writeFileSync('./.docker/config/api.json', data);

