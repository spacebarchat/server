import express, { Application, NextFunction, Request, Response, Router } from "express";
import { traverseDirectory } from "./Utils";
import { Server as HTTPServer } from "http";
import { HTTPError } from "./HTTPError";
// import "express-async-errors";
import bodyParser from "body-parser";
// import helmet from "helmet";
import http from "http";
import chalk from "chalk";

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            server: Server;
        }
    }
}

export type ServerOptions = {
    port: number;
    host: string;
    production: boolean;
    serverInitLogging: boolean;
    // errorHandler?: { (err: Error, req: Request, res: Response, next: NextFunction): any };
    jsonBody: boolean;
    server: http.Server;
    app: Application;
};

// Overwrite default options for Router with default value true for mergeParams
const oldRouter = express.Router;
express.Router = function (options?: express.RouterOptions | undefined): Router {
    if (!options) options = {};
    if (options.mergeParams == null) options.mergeParams = true;

    return oldRouter(options);
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
        // if (opts.errorHandler == null) opts.errorHandler = this.errorHandler;
        if (opts.jsonBody == null) opts.jsonBody = true;
        if (opts.server) this.http = opts.server;

        this.options = <ServerOptions>opts;

        if (opts.app) this.app = opts.app;
        else this.app = express();
    }

    // protected secureExpress() {
    // 	this.app.use(helmet.contentSecurityPolicy());
    // 	this.app.use(helmet.expectCt);
    // 	this.app.use(helmet.originAgentCluster());
    // 	this.app.use(helmet.referrerPolicy({ policy: "same-origin" }));
    // 	this.app.use(helmet.hidePoweredBy());
    // 	this.app.use(helmet.noSniff());
    // 	this.app.use(helmet.dnsPrefetchControl({ allow: true }));
    // 	this.app.use(helmet.ieNoOpen());
    // 	this.app.use(helmet.frameguard({ action: "deny" }));
    // 	this.app.use(helmet.permittedCrossDomainPolicies({ permittedPolicies: "none" }));
    // }

    public errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
        try {
            let code;
            let message = error?.toString();

            if (error instanceof HTTPError && error.code) code = error.code || 400;
            else {
                console.error(error);
                if (this.options.production) {
                    message = "Internal Server Error";
                }
                code = 500;
            }

            res.status(code).json({ success: false, code: code, error: true, message });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ success: false, code: 500, error: true, message: "Internal Server Error" });
        }
    };

    async start() {
        const server = this.http || this.app;
        if (!server.listening) {
            await new Promise<void>((res) => {
                this.http = server.listen(this.options.port, () => res());
            });
            if (this.options.serverInitLogging) console.log(`[Server] started on ${this.options.host}:${this.options.port}`);
        }
    }

    async registerRoutes(root: string) {
        this.app.use((req, res, next) => {
            req.server = this;
            next();
        });
        if (this.options.jsonBody) this.app.use(bodyParser.json());
        const result = await traverseDirectory({ dirname: root, recursive: true }, this.registerRoute.bind(this, root));
        // if (this.options.errorHandler) this.app.use(this.options.errorHandler);
        // if (this.options.production) this.secureExpress();
        return result;
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

            // if (this.options.errorHandler) router.use(this.options.errorHandler);
            this.app.use(path, <Router>router);

            if (this.options.serverInitLogging) console.log(`[Server] Route ${path} registered`);

            return router;
        } catch (error) {
            console.error(new Error(`[Server] Failed to register route ${path}: ${error}`));
        }
    }

    stop() {
        return new Promise<void>((res) => this.http.close(() => res()));
    }
}
