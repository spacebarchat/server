import { Config } from "./Config";
import { initDatabase } from "./Database";

type StartupTask = () => Promise<unknown> | unknown;

export const STARTUP_FAILURE_MESSAGE = "spacebar:startupFailure";

export interface StartupFailureMessage {
    type: typeof STARTUP_FAILURE_MESSAGE;
    serviceName: string;
}

export interface StartupInitializationOptions {
    configPath?: string;
    initConfig?: StartupTask;
    initDatabase?: StartupTask;
}

export interface StartupExitOptions {
    exit?: (code: number) => void;
    logError?: (...args: unknown[]) => void;
}

export interface ClusterStartupFailureOptions extends StartupExitOptions {
    workerPid?: number;
}

export const initStartupConfigAndDatabase = async (options: StartupInitializationOptions = {}) => {
    const configPath = options.configPath ?? process.env.CONFIG_PATH;
    const initializeConfig = options.initConfig ?? (() => Config.init());
    const initializeDatabase = options.initDatabase ?? (() => initDatabase());

    if (configPath) await initializeConfig();
    await initializeDatabase();
    if (!configPath) await initializeConfig();
};

export const isStartupFailureMessage = (message: unknown): message is StartupFailureMessage =>
    typeof message === "object" &&
    message != null &&
    "type" in message &&
    message.type === STARTUP_FAILURE_MESSAGE &&
    "serviceName" in message &&
    typeof message.serviceName === "string";

export const handleClusterStartupFailure = (message: unknown, options: ClusterStartupFailureOptions = {}) => {
    if (!isStartupFailureMessage(message)) return false;

    const logError = options.logError ?? console.error;
    const worker = options.workerPid == null ? "worker" : `worker ${options.workerPid}`;
    logError(`[Startup] ${message.serviceName} failed to start in ${worker}; shutting down primary process.`);

    const exit = options.exit ?? ((code: number) => process.exit(code));
    exit(1);
    return true;
};

export const runStartupOrExit = async (serviceName: string, startup: StartupTask, options: StartupExitOptions = {}) => {
    try {
        await startup();
    } catch (error) {
        const logError = options.logError ?? console.error;
        logError(`[Startup] Failed to start ${serviceName}.`);
        logError(error);

        const exit = options.exit ?? ((code: number) => process.exit(code));
        const message: StartupFailureMessage = { type: STARTUP_FAILURE_MESSAGE, serviceName };

        if (!options.exit && typeof process.send === "function") {
            process.send(message, () => exit(1));
            return;
        }

        exit(1);
    }
};
