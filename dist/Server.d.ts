/// <reference types="node" />
import { Application, Router } from "express";
import { Database } from "lambert-db";
import { Server as HTTPServer } from "http";
import "express-async-errors";
export declare type ServerOptions = {
    db: string;
    port: number;
    host: string;
};
declare global {
    namespace Express {
        interface Request {
            server: Server;
        }
    }
}
export declare class Server {
    app: Application;
    http: HTTPServer;
    db: Database;
    routes: Router[];
    options: ServerOptions;
    constructor(options?: Partial<ServerOptions>);
    init(): Promise<void>;
    registerRoutes(root: string): Promise<any[]>;
    registerRoute(root: string, file: string): any;
    destroy(): Promise<void>;
}
