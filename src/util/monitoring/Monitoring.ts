/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import http, { IncomingMessage, ServerResponse } from "node:http";
import * as client from "prom-client";
import { Application, Router } from "express";
import { sleep } from "@spacebar/util";

export class Monitoring {
    static isInitialised = false;
    public static async init() {
        if (Monitoring.isInitialised) return;
        console.log("[Monitoring] Initialising prometheus metrics");
        client.collectDefaultMetrics();
        Monitoring.isInitialised = true;
    }

    public static attach(app: Application) {
        const a = app;
        const http_request_total = new client.Counter({
            name: "node_http_request_total",
            help: "The total number of HTTP requests received",
            labelNames: ["path", "method", "status_code"],
        });
        client.register.registerMetric(http_request_total);

        const http_response_rate_histogram = new client.Histogram({
            name: "node_http_duration",
            labelNames: ["path", "method", "status_code"],
            help: "The duration of HTTP requests in seconds",
            buckets: [0.0, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 10],
        });
        client.register.registerMetric(http_response_rate_histogram);

        app.use((req, res, next) => {
            const endTimer = http_response_rate_histogram.startTimer();
            res.on("finish", () => {
                const r = req;
                const path = (res.locals.lambertRouteBase ?? req.baseUrl ?? "") + req.route?.path;
                if (!req.route?.path) {
                    console.log(req);
                }
                endTimer({ method: req.method, path, status_code: res.statusCode });
                http_request_total.inc({ method: req.method, path, status_code: res.statusCode });
            });
            next();
        });

        app.get("/metrics", async (req, res) => {
            res.setHeader("Content-Type", client.register.contentType);
            const metrics = await client.register.metrics();
            res.send(metrics);
        });
    }

    static async handleRawRequest(req: IncomingMessage, res: ServerResponse) {
        const metrics = await client.register.metrics();
        res.setHeader("Content-Type", client.register.contentType).writeHead(200).end(metrics);
    }
}
