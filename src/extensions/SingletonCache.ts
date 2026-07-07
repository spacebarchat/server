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

import { TimeSpan } from "./Timespan";
import { sleep } from "./index";

export class SingletonCache<T> {
    private expiry: TimeSpan;
    private lastUpdated: Date = new Date(0);
    private isLocked: boolean = false;
    private cachedValue: T;

    constructor(expiry: TimeSpan) {
        this.expiry = expiry;
    }

    async getOrUpdate(factory: () => Promise<T>): Promise<T> {
        if (new TimeSpan(this.lastUpdated.getTime(), Date.now()).totalMillis < this.expiry.totalMillis) return this.cachedValue;

        if (this.isLocked) {
            // avoid running the factory twice (async)
            while (this.isLocked) await sleep(50);
            return this.cachedValue;
        }

        this.isLocked = true;
        try {
            const result = await factory();
            this.cachedValue = result;
            return result;
        } catch (e) {
            console.log(`[SingletonCache] Factory method failed, returning stale value:`, e);
            return this.cachedValue;
        } finally {
            this.isLocked = false;
        }
    }
}
