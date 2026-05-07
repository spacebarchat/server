import fs from "node:fs/promises";

const getJsonPosition = (input: string, position: number) => {
    const beforePosition = input.slice(0, position);
    const line = beforePosition.split("\n").length;
    const column = position - beforePosition.lastIndexOf("\n");

    return { line, column };
};

const formatJsonParseError = (error: SyntaxError, input: string) => {
    const position = /position (\d+)/i.exec(error.message)?.[1];
    if (position == null) return error.message;

    const { line, column } = getJsonPosition(input, Number(position));
    return `${error.message} (line ${line}, column ${column})`;
};

export const readJsonConfigFile = async (configPath: string) => {
    let contents: string;

    try {
        contents = await fs.readFile(configPath, "utf8");
    } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        const message = (error as Error).message;

        if (code === "ENOENT") {
            throw new Error(`[Config] CONFIG_PATH file does not exist: ${configPath}. Create the file or unset CONFIG_PATH to load configuration from the database.`);
        }

        if (code === "EISDIR") {
            throw new Error(`[Config] CONFIG_PATH points to a directory, not a JSON file: ${configPath}`);
        }

        throw new Error(`[Config] Failed to read CONFIG_PATH file '${configPath}': ${message}`);
    }

    if (contents.trim().length === 0) {
        throw new Error(`[Config] CONFIG_PATH file is empty: ${configPath}. Provide a JSON object or unset CONFIG_PATH to load configuration from the database.`);
    }

    try {
        const parsed = JSON.parse(contents);

        if (parsed == null || Array.isArray(parsed) || typeof parsed !== "object") {
            throw new Error(`[Config] CONFIG_PATH must contain a JSON object: ${configPath}`);
        }

        return parsed as Record<string, unknown>;
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error(`[Config] Failed to parse CONFIG_PATH JSON '${configPath}': ${formatJsonParseError(error, contents)}`);
        }

        throw error;
    }
};
