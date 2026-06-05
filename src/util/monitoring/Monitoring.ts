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

import { IncomingMessage, ServerResponse } from "node:http";
import * as client from "prom-client";
import { Application } from "express";
import { Metric } from "prom-client";

export class Monitoring {
    static isInitialised = false;
    public static async init() {
        if (Monitoring.isInitialised) return;
        console.log("[Monitoring] Initialising prometheus metrics");
        client.collectDefaultMetrics({ prefix: "spacebar_" });
        Monitoring.isInitialised = true;
    }

    public static attachMetric<T extends Metric>(name: string, metric: T): T {
        const existingMetric = client.register.getSingleMetric(name);
        // TODO: is there any way to *ensure* the metric is T? We're assuming that there's no conflicting definitions across the app...
        if (existingMetric) return existingMetric as T;
        client.register.registerMetric(metric);
        return metric;
    }

    public static attach(app: Application) {
        const http_request_total = new client.Counter({
            name: "spacebar_http_request_total",
            help: "The total number of HTTP requests received",
            labelNames: ["path", "method", "status_code"],
        });
        client.register.registerMetric(http_request_total);

        const http_response_rate_histogram = new client.Histogram({
            name: "spacebar_http_duration",
            labelNames: ["path", "method", "status_code"],
            help: "The duration of HTTP requests in seconds",
            buckets: [0.0, 0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 10],
        });
        client.register.registerMetric(http_response_rate_histogram);

        app.use((req, res, next) => {
            const endTimer = http_response_rate_histogram.startTimer();
            res.on("finish", () => {
                const path = (res.locals.lambertRouteBase ?? req.baseUrl ?? "") + req.route?.path;
                if (!req.route?.path && req.method !== "OPTIONS") {
                    console.log("[Monitoring] Request route path was undefined? Request path:", req.path, "Request route:", req.route);
                }
                endTimer({ method: req.method, path, status_code: res.statusCode });

                // OPTIONS requests don't set path due to not being routed... discard unhandled ones
                if (!path && req.method === "OPTIONS") return;

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
