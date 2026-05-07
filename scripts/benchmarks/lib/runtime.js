"use strict";

const fs = require("node:fs");
const http = require("node:http");
const { createRequire } = require("node:module");
const path = require("node:path");

function packagePath(repoRoot) {
    return path.join(repoRoot, "package.json");
}

function repoRequire(repoRoot, request) {
    return createRequire(packagePath(repoRoot))(request);
}

function repoPath(repoRoot, ...segments) {
    return path.join(repoRoot, ...segments);
}

function requireRepoFile(repoRoot, ...segments) {
    const file = repoPath(repoRoot, ...segments);
    if (!fs.existsSync(file)) {
        throw new Error(`Benchmark requires built file ${path.relative(repoRoot, file)}. Run npm run build:src first.`);
    }
    return require(file);
}

function captureEnv(keys) {
    return Object.fromEntries(keys.map((key) => [key, process.env[key]]));
}

function restoreEnv(previousEnv) {
    for (const [key, value] of Object.entries(previousEnv)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
    }
}

function overrideEnv(overrides) {
    const previousEnv = captureEnv(Object.keys(overrides));

    for (const [key, value] of Object.entries(overrides)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = String(value);
    }

    return previousEnv;
}

function defaultEnv(defaults) {
    const missing = Object.fromEntries(Object.entries(defaults).filter(([key]) => process.env[key] === undefined));
    return overrideEnv(missing);
}

function listenServer(server, port = 0, host = "127.0.0.1") {
    return new Promise((resolve, reject) => {
        const onError = (error) => {
            server.off("listening", onListening);
            reject(error);
        };
        const onListening = () => {
            server.off("error", onError);
            resolve(server.address());
        };

        server.once("error", onError);
        server.once("listening", onListening);
        server.listen(port, host);
    });
}

function closeServer(server) {
    if (!server?.listening) return Promise.resolve();

    return new Promise((resolve, reject) => {
        server.close((error) => {
            if (error) reject(error);
            else resolve();
        });
    });
}

async function createReservedServer(app, host = "127.0.0.1") {
    const server = http.createServer(app);
    const address = await listenServer(server, 0, host);

    return {
        app,
        port: address.port,
        server,
    };
}

module.exports = {
    closeServer,
    createReservedServer,
    defaultEnv,
    overrideEnv,
    repoPath,
    repoRequire,
    requireRepoFile,
    restoreEnv,
};
