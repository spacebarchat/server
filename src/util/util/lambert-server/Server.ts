import express, { Application, Router } from "express";
import { Server as HTTPServer } from "http";
import http from "http";

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

    registerRoute(root: string, file: string): Router | undefined {
        if (root.endsWith("/") || root.endsWith("\\")) root = root.slice(0, -1); // removes slash at the end of the root dir
        let path = file.replace(root, ""); // remove root from path and
        path = path.split(".").slice(0, -1).join("."); // trancate .js/.ts file extension of path
        path = path.replaceAll("#", ":").replaceAll("!", "?").replaceAll("\\", "/");
        if (path.endsWith("/index")) path = path.slice(0, -6); // delete index from path
        if (!path.length) path = "/"; // first root index.js file must have a / path

        try {
            let router = require(file);
            if (router.router) router = router.router;
            if (router.default) router = router.default;
            if (!router || router?.prototype?.constructor?.name !== "router") throw `File doesn't export any default router`;

            this.app.use(path, <Router>router);

            if (this.options.serverInitLogging && process.env.LOG_ROUTES !== "false") console.log(`[Server] Route ${path} registered`);

            return router;
        } catch (error) {
            console.error(new Error(`[Server] Failed to register route ${path}: ${error}`));
        }
    }

    stop() {
        return new Promise<void>((res) => this.http.close(() => res()));
    }
}
