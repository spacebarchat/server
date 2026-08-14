import express, { Application, Router } from "express";
import http, { Server as HTTPServer } from "node:http";

export type ServerOptions = {
    port: number;
    host: string;
    production: boolean;
    serverInitLogging: boolean;
    server: http.Server;
    app: Application;
};

export class Server {
    public app: Application;
    public http: HTTPServer;
    public options: ServerOptions;
    public routes: Router[];

    constructor(opts?: Partial<ServerOptions>) {
        if (!opts) opts = {};
        if (!opts.port) opts.port = 8080;
        if (!opts.host) opts.host = "0.0.0.0";
        if (opts.production == null) opts.production = false;
        if (opts.serverInitLogging == null) opts.serverInitLogging = true;
        if (opts.server) this.http = opts.server;

        this.options = <ServerOptions>opts;

        if (opts.app) this.app = opts.app;
        else this.app = express();
    }

    async start() {
        const server = this.http || this.app;
        if (!server.listening) {
            await new Promise<void>((res) => {
                this.http = server.listen(this.options.port, () => res());
            });
            if (this.options.serverInitLogging) console.log(`[Server] started on ${this.options.host}:${this.options.port}`);
        }
    }

    registerRoute(root: string, file: string, destRouter: Router | undefined = undefined): Router | undefined {
        if (root.endsWith("/") || root.endsWith("\\")) root = root.slice(0, -1); // removes slash at the end of the root dir
        let path = file.replace(root, ""); // remove root from path and
        path = path.split(".").slice(0, -1).join("."); // trancate .js/.ts file extension of path
        path = path.replaceAll("#", ":").replaceAll("!", "?").replaceAll("\\", "/");
        // special handling for percent encoded path params (eg. path parts that start with "."->"%2E")
        // neither eslint, typescript nor this code is compatible with just having a "."
        path = path.replaceAll(/%[A-Za-z0-9]{2}/g, (match) => decodeURIComponent(match));
        if (path.endsWith("/index")) path = path.slice(0, -6); // delete index from path
        if (!path.length) path = "/"; // first root index.js file must have a / path

        try {
            let router = require(file);
            if (router.router) router = router.router;
            if (router.default) router = router.default;
            if (!router || router?.prototype?.constructor?.name !== "router") throw `File doesn't export any default router`;

            (destRouter ?? this.app).use(
                path,
                // TODO: I wish this middleware wasn't nessecary to preserve base path param names for monitoring...
                (_, res, next) => {
                    res.locals.lambertRouteBase = path;
                    next();
                },
                <Router>router,
            );

            if (this.options.serverInitLogging && process.env.LOG_ROUTES !== "false") console.log(`[Server] Route ${path} registered`);

            return router;
        } catch (error) {
            const err = new Error(`[Server] Failed to register route ${path}: ${error}`);
            err.stack = (err.stack ?? "") + "\n  Inner exception: " + (<Error>error).stack!.replaceAll("/:", "/index.ts:");
            console.error(err);
        }
    }

    stop() {
        return new Promise<void>((res) => void this.http.close(() => res()));
    }
}
