"use strict";

function parseArgs(argv) {
    const options = {};
    const positionals = [];

    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];

        if (!arg.startsWith("--")) {
            positionals.push(arg);
            continue;
        }

        const [rawKey, inlineValue] = arg.slice(2).split("=", 2);
        const key = rawKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        let value = inlineValue;

        if (value === undefined) {
            const next = argv[i + 1];
            if (next && !next.startsWith("--")) {
                value = next;
                i += 1;
            } else {
                value = true;
            }
        }

        if (options[key] === undefined) {
            options[key] = value;
        } else if (Array.isArray(options[key])) {
            options[key].push(value);
        } else {
            options[key] = [options[key], value];
        }
    }

    return { options, positionals };
}

function optionNumber(options, key, fallback) {
    if (options[key] === undefined || options[key] === true) return fallback;

    const value = Number(options[key]);
    if (!Number.isFinite(value)) throw new Error(`Invalid numeric option --${key}: ${options[key]}`);
    return value;
}

function optionBoolean(options, key, fallback = false) {
    if (options[key] === undefined) return fallback;
    if (options[key] === true) return true;
    if (options[key] === false) return false;

    const value = String(options[key]).toLowerCase();
    if (["1", "true", "yes", "on"].includes(value)) return true;
    if (["0", "false", "no", "off"].includes(value)) return false;
    throw new Error(`Invalid boolean option --${key}: ${options[key]}`);
}

function optionList(options, key) {
    const value = options[key];
    if (value === undefined || value === true) return [];

    const values = Array.isArray(value) ? value : [value];
    return values.flatMap((item) =>
        String(item)
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean),
    );
}

module.exports = {
    optionBoolean,
    optionList,
    optionNumber,
    parseArgs,
};
