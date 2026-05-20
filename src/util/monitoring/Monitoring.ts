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

import * as client from "prom-client";
import { Router } from "express";

export class Monitoring {
    static isInitialised = false;
    public static async init() {
        if (Monitoring.isInitialised) return;
        console.log("[Monitoring] Initialising prometheus metrics");
        client.collectDefaultMetrics();
        Monitoring.isInitialised = true;
    }

    public static attach(router: Router) {
        router.get("/metrics", async (req, res) => {
            res.setHeader("Content-Type", client.register.contentType);
            const metrics = await client.register.metrics();
            res.send(metrics);
        });
    }
}
