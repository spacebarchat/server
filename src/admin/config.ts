import { Config, ConfigValue, Event, emitEvent } from "@spacebar/util";
import { HTTPError } from "lambert-server";
import { AdminConfiguration, toAdminConfiguration } from "./dto";

export type AdminEventEmitter = (payload: Omit<Event, "created_at">) => Promise<void>;

export interface ConfigPersistenceMode {
    source: "database" | "json";
    path: string | null;
    readonly: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getConfigPersistenceMode(): ConfigPersistenceMode {
    return {
        source: process.env.CONFIG_PATH ? "json" : "database",
        path: process.env.CONFIG_PATH ?? null,
        readonly: Boolean(process.env.CONFIG_READONLY),
    };
}

export function assertAdminConfigurationWritable(mode = getConfigPersistenceMode()) {
    if (mode.source === "json" && mode.readonly) {
        throw new HTTPError("JSON configuration is readonly; unset CONFIG_READONLY to persist admin configuration changes", 409);
    }
}

export function parseAdminConfigurationUpdate(body: unknown): Partial<ConfigValue> {
    if (!isRecord(body)) {
        throw new HTTPError("Configuration body must be an object", 400);
    }

    return body as Partial<ConfigValue>;
}

export function createConfigReloadEvent(origin: string): Omit<Event, "created_at"> {
    return {
        event: "SB_RELOAD_CONFIG",
        guild_id: "0",
        data: {},
        origin,
    };
}

export async function emitConfigReload(origin: string, emitter: AdminEventEmitter = emitEvent) {
    await emitter(createConfigReloadEvent(origin));
}

export async function updateAdminConfiguration(body: unknown, emitter: AdminEventEmitter = emitEvent): Promise<AdminConfiguration> {
    assertAdminConfigurationWritable();
    const update = parseAdminConfigurationUpdate(body);

    await Config.set(update);
    await emitConfigReload("Admin API (PUT /configuration)", emitter);

    return toAdminConfiguration();
}

export async function reloadAdminConfiguration(emitter: AdminEventEmitter = emitEvent): Promise<AdminConfiguration> {
    await Config.init(true);
    await emitConfigReload("Admin API (POST /configuration/reload)", emitter);

    return toAdminConfiguration();
}
