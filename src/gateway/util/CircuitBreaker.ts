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

export class CircuitBreaker {
    private failures = 0;
    private lastFailureTime = 0;
    private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";

    constructor(
        private readonly failureThreshold: number = 5,
        private readonly recoveryTimeout: number = 60000,
        private readonly name: string = "CircuitBreaker",
    ) {}

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === "OPEN") {
            if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
                this.state = "HALF_OPEN";
                console.log(`[${this.name}] Circuit breaker transitioning to HALF_OPEN`);
            } else {
                throw new Error(`[${this.name}] Circuit breaker is OPEN`);
            }
        }

        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess() {
        this.failures = 0;
        this.state = "CLOSED";
    }

    private onFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();

        if (this.failures >= this.failureThreshold) {
            this.state = "OPEN";
            console.error(`[${this.name}] Circuit breaker opened after ${this.failures} failures`);
        }
    }

    getState() {
        return this.state;
    }

    isOpen() {
        return this.state === "OPEN";
    }
}

// gloabl circuit breakers for critical services
export const databaseCircuitBreaker = new CircuitBreaker(5, 30000, "Database");
export const rabbitMQCircuitBreaker = new CircuitBreaker(3, 60000, "RabbitMQ");
