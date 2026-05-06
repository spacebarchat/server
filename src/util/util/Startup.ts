import { Config } from "./Config";
import { initDatabase } from "./Database";

type StartupTask = () => Promise<unknown> | unknown;

export interface StartupInitializationOptions {
    configPath?: string;
    initConfig?: StartupTask;
    initDatabase?: StartupTask;
}

export interface StartupExitOptions {
    exit?: (code: number) => void;
    logError?: (...args: unknown[]) => void;
}

export const initStartupConfigAndDatabase = async (options: StartupInitializationOptions = {}) => {
    const configPath = options.configPath ?? process.env.CONFIG_PATH;
    const initializeConfig = options.initConfig ?? (() => Config.init());
    const initializeDatabase = options.initDatabase ?? (() => initDatabase());

    if (configPath) await initializeConfig();
    await initializeDatabase();
    if (!configPath) await initializeConfig();
};

export const runStartupOrExit = async (serviceName: string, startup: StartupTask, options: StartupExitOptions = {}) => {
    try {
        await startup();
    } catch (error) {
        const logError = options.logError ?? console.error;
        logError(`[Startup] Failed to start ${serviceName}.`);
        logError(error);

        const exit = options.exit ?? ((code: number) => process.exit(code));
        exit(1);
    }
};
