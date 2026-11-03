/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { OrmUtils } from "../imports";
import { ConfigValue, EnvConfig } from "../config";
import { ConfigEntity } from "../../database/entities";
import { JsonValue } from "@protobuf-ts/runtime";
import { bold, red, redBright, yellow, yellowBright } from "picocolors";

let cachedConfig: ConfigValue;
let cachedConfigWithOverrides: ConfigValue | undefined;
let cachedPairs: ConfigEntity[];

// TODO: use events to inform about config updates
// Config keys are separated with _

export class Config {
    public static async init(force: boolean = false) {
        if ((cachedConfigWithOverrides || cachedConfig) && !force) return cachedConfigWithOverrides ?? cachedConfig;
        console.log("[Config] Loading configuration...");

        const { path: jsonPath, enabled: jsonEnabled, mode: jsonMode, writebackEnabled: jsonWritebackEnabled } = EnvConfig.get().configuration;
        let jsonConfig: ConfigValue;

        if (jsonEnabled) console.log(`[Config] Using JSON configuration file at ${jsonPath} in '${jsonMode}' mode.`);
        else {
            // TODO: CONFIG_SOURCE not implemented
            console.log("[Config]:", redBright("Warning:"), bold("Database driven configuration has been deprecated"));
            console.log("[Config]:", redBright("Warning:"), "Please migrate to JSON configuration by setting CONFIG_PATH=/path/to/config.json");
            console.log("[Config]:", redBright("Warning:"), "  or set CONFIG_SOURCE=database to ignore this warning for now.");
            console.log("[Config]:", redBright("Warning:"), "");
            console.log("[Config]:", redBright("Warning:"), "Note that this option will be removed soon, and lack hereof will stop the server from starting!");
        }

        if (jsonEnabled && jsonMode === "single") {
            if (!existsSync(jsonPath)) throw new Error(`[Config] CONFIG_PATH does not exist, but CONFIG_MODE is set to 'single'. Please ensure the file at ${jsonPath} exists.`);
            jsonConfig = JSON.parse((await fs.readFile(jsonPath)).toString());

            // merge with defaults to allow partial configs
            cachedConfig = OrmUtils.mergeDeep({}, { ...new ConfigValue() }, jsonConfig);
            return await saveConfig(cachedConfig); // handle writeback if enabled
        }

        if (jsonEnabled && existsSync(jsonPath) && jsonMode === "overwrite") {
            console.log(`[Config] Loading configuration from JSON file at ${jsonPath}...`);
            jsonConfig = JSON.parse((await fs.readFile(jsonPath)).toString());
            console.log("[Config] Overwriting database configuration with JSON configuration...");
            await saveConfigToDatabaseAtomic(jsonConfig);
        }

        console.log("[Config] Loading configuration from database...");
        cachedPairs = await validateConfig();
        cachedConfig = pairsToConfig(cachedPairs);

        // If a config doesn't exist, create it.
        if (Object.keys(cachedConfig).length == 0) cachedConfig = new ConfigValue();

        cachedConfig = OrmUtils.mergeDeep({}, { ...new ConfigValue() }, cachedConfig);

        let ret = await this.set(cachedConfig);

        if (jsonEnabled && existsSync(jsonPath) && jsonMode === "override") {
            console.log(`[Config] Loading configuration from JSON file at ${jsonPath}...`);
            jsonConfig = JSON.parse((await fs.readFile(jsonPath)).toString());
            console.log("[Config] Overriding database configuration values with JSON configuration...");
            ret = cachedConfigWithOverrides = OrmUtils.mergeDeep({}, cachedConfig, jsonConfig);
        }

        const changes = getChanges(ret!);
        for (const [key, change] of Object.entries(changes)) {
            if (change.type === "changed") {
                console.log(yellowBright(`[Config] Setting '${key}' has been changed from '${JSON.stringify(change.old)}' to '${JSON.stringify(change.new)}'`));
            } else if (change.type === "unknown") {
                console.log(yellow(`[Config] Unknown setting '${key}' with value '${JSON.stringify(change.new)}'`));
            }
        }

        // TODO: factor this out someday
        if (process.env.CDN_SIGNATURE_PATH) ret!.security.cdnSignatureKey = await Config.readSecret("CDN_SIGNATURE_PATH");
        if (process.env.LEGACY_JWT_SECRET_PATH) ret!.security.jwtSecret = await Config.readSecret("LEGACY_JWT_SECRET_PATH");
        if (process.env.MAILJET_API_KEY_PATH) ret!.email.mailjet.apiKey = await Config.readSecret("MAILJET_API_KEY_PATH");
        if (process.env.MAILJET_API_SECRET_PATH) ret!.email.mailjet.apiSecret = await Config.readSecret("MAILJET_API_SECRET_PATH");
        if (process.env.SMTP_PASSWORD_PATH) ret!.email.smtp.password = await Config.readSecret("SMTP_PASSWORD_PATH");
        if (process.env.GIF_API_KEY_PATH) ret!.gif.apiKey = await Config.readSecret("GIF_API_KEY_PATH");
        if (process.env.RABBITMQ_HOST) ret!.rabbitmq.host = process.env.RABBITMQ_HOST.trim();
        if (process.env.RABBITMQ_HOST_PATH) ret!.rabbitmq.host = await Config.readSecret("RABBITMQ_HOST_PATH");
        if (process.env.ABUSEIPDB_API_KEY_PATH) ret!.security.abuseIpDbApiKey = await Config.readSecret("ABUSEIPDB_API_KEY_PATH");
        if (process.env.CAPTCHA_SECRET_KEY_PATH) ret!.security.captcha.secret = await Config.readSecret("CAPTCHA_SECRET_KEY_PATH");
        if (process.env.CAPTCHA_SITE_KEY_PATH) ret!.security.captcha.sitekey = await Config.readSecret("CAPTCHA_SITE_KEY_PATH");
        if (process.env.IPDATA_API_KEY_PATH) ret!.security.ipdataApiKey = await Config.readSecret("IPDATA_API_KEY_PATH");
        if (process.env.REQUEST_SIGNATURE_PATH) ret!.security.requestSignature = await Config.readSecret("REQUEST_SIGNATURE_PATH");
        if (process.env.KLIPY_API_KEY_PATH) ret!.integrations.gifs.klipy.apiKeyPath = process.env.KLIPY_API_KEY_PATH;

        validateFinalConfig(ret!);
        return ret;
    }

    private static async readSecret(name: string) {
        process.stdout.write(`[Config] Reading secret ${name}...`);
        const res = (await fs.readFile(process.env[name]!, "utf-8")).trim();
        if (process.env.LOG_SECRET_VALUES) process.stdout.write(" " + res);
        else process.stdout.write(" Done!");
        process.stdout.write("\n");
        return res;
    }

    public static get() {
        if (!cachedConfig) {
            // If we haven't initialised the config yet, return default config.
            // Typeorm instantiates each entity once when initialising database,
            // which means when we use config values as default values in entity classes,
            // the config isn't initialised yet and would throw an error about the config being undefined.

            return new ConfigValue();
        }

        return cachedConfigWithOverrides ?? cachedConfig;
    }
    public static set(val: Partial<ConfigValue>) {
        if (!cachedConfig || !val) return;
        cachedConfig = OrmUtils.mergeDeep(cachedConfig, val);

        return saveConfig(val);
    }
}

// TODO: better types
function generatePairs(obj: object | null, key = ""): ConfigEntity[] {
    if (typeof obj == "object" && obj != null) {
        return Object.keys(obj)
            .map((k) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                generatePairs((obj as any)[k], key ? `${key}_${k}` : k),
            )
            .flat();
    }

    const ret = new ConfigEntity();
    ret.key = key;
    ret.value = obj;
    return [ret];
}

async function saveConfig(val: Partial<ConfigValue>) {
    const merged = OrmUtils.mergeDeep({}, cachedConfig, val) as ConfigValue;
    if (EnvConfig.get().configuration.enabled) {
        if (EnvConfig.get().configuration.writebackEnabled) {
            await fs.writeFile(EnvConfig.get().configuration.path, JSON.stringify(merged, null, 4));
        } else {
            console.log("[Config/WARN] JSON config file in use, and writeback is disabled!");
            console.log("[Config/WARN] Programmatic config changes will not be persisted, and your config will not get updated!");
            console.log("[Config/WARN] Please check regularly to make adjustments as necessary!");
        }

        if (EnvConfig.get().configuration.mode == "overwrite") await saveConfigToDatabaseAtomic(val);
    } else await saveConfigToDatabaseAtomic(val); // not using a JSON file

    return merged;
}

// Atomically save changes to database
async function saveConfigToDatabaseAtomic(val: Partial<ConfigValue>) {
    const pairs = generatePairs(val);
    const pairsToUpdate =
        cachedPairs === undefined ? pairs : pairs.filter((p) => cachedPairs.some((cp) => cp.key === p.key && JSON.stringify(cp.value) !== JSON.stringify(p.value)));

    if (pairsToUpdate.length > 0) console.log("[Config] Atomic update:", pairsToUpdate);

    // keys are sorted to try to influence database order...
    await Promise.all(pairsToUpdate.sort((x, y) => (x.key > y.key ? 1 : -1)).map((pair) => pair.save()));
}

function pairsToConfig(pairs: ConfigEntity[]) {
    // TODO: typings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value: any = {};

    pairs.forEach((p) => {
        const keys = p.key.split("_");
        let obj = value;
        let prev = "";
        let prevObj = obj;
        let i = 0;

        for (const key of keys) {
            if (!isNaN(Number(key)) && !prevObj[prev]?.length) prevObj[prev] = obj = [];
            if (i++ === keys.length - 1) obj[key] = p.value;
            else if (!obj[key]) obj[key] = {};

            prev = key;
            prevObj = obj;
            obj = obj[key];
        }
    });

    return value as ConfigValue;
}

const validateConfig = async () => {
    let hasErrored = false;
    const totalStartTime = new Date();
    const config = await ConfigEntity.find({ select: { key: true }, order: { key: "ASC" } });

    for (const row in config) {
        // extension methods...
        if (typeof config[row] === "function") continue;

        try {
            const found = await ConfigEntity.findOne({
                where: { key: config[row].key },
            });
            if (!found) continue;
            config[row] = found;
        } catch (e) {
            console.error(`Config key '${config[row].key}' has invalid JSON value: ${(e as Error)?.message}`);
            hasErrored = true;
        }
    }

    console.log("[Config] Total config load time:", new Date().getTime() - totalStartTime.getTime(), "ms");

    if (hasErrored) {
        console.error("[Config] Your config has invalid values. Fix them first https://docs.spacebar.chat/setup/server/configuration");
        process.exit(1);
    }

    return config;
};

function validateFinalConfig(config: ConfigValue) {
    let hasErrors = false;
    function assertConfig(path: string, condition: (val: JsonValue) => boolean, recommendedValue: string) {
        // _ to separate keys
        const keys = path.split("_");
        let obj: never = config as never;

        for (const key of keys) {
            if (obj == null || !(key in obj)) {
                console.warn(`[Config] Missing config value for '${path}'. Recommended value: ${recommendedValue}`);
                return;
            }
            obj = obj[key];
        }

        if (!condition(obj)) {
            console.warn(`[Config] Invalid config value for '${path}': ${obj}. Recommended value: ${recommendedValue}`);
            hasErrors = true;
        }
    }

    assertConfig(
        "general_serverName",
        (v) => v != null,
        'A valid domain hosting your .well-known (defaulting to https at port 443), eg. "spacebar.chat" or "http://localhost:3001"',
    );
    assertConfig("api_endpointPublic", (v) => v != null, 'A valid public API endpoint URL, eg. "http://localhost:3001/api/v9"');
    assertConfig("cdn_endpointPublic", (v) => v != null, 'A valid public CDN endpoint URL, eg. "http://localhost:3003/"');
    assertConfig("cdn_endpointPrivate", (v) => v != null, 'A valid private CDN endpoint URL, eg. "http://localhost:3003/" - must be routable from the API server!');
    assertConfig("gateway_endpointPublic", (v) => v != null, 'A valid public gateway endpoint URL, eg. "ws://localhost:3002/"');

    if (hasErrors) {
        console.error("[Config] Your config has invalid values. Fix them first https://docs.spacebar.chat/setup/server/configuration");
        console.error("[Config] Hint: if you're just testing with bundle (`npm run start`), you can set all endpoint URLs to [proto]://localhost:3001");
        process.exit(1);
    } else console.log("[Config] Configuration validated successfully.");
}

function getChanges(config: ConfigValue) {
    const defaultPairs = generatePairs(new ConfigValue());
    const newPairs = generatePairs(cachedConfig);
    const ignoredKeys = ["general_instanceId", "security_requestSignature", "security_jwtSecret", "security_cdnSignatureKey"];
    const changes: { [key: string]: { type: "changed" | "unknown"; old?: string | number | boolean | null | undefined; new: string | number | boolean | null | undefined } } = {};

    for (const newPair of newPairs) {
        const defaultPair = defaultPairs.find((p) => p.key === newPair.key);
        if (defaultPair && JSON.stringify(defaultPair.value) !== JSON.stringify(newPair.value) && !ignoredKeys.includes(newPair.key)) {
            changes[newPair.key] = { type: "changed", old: defaultPair.value, new: newPair.value };
        } else if (!defaultPair) {
            changes[newPair.key] = { type: "unknown", new: newPair.value };
        }
    }
    return changes;
}
