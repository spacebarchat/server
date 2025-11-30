/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors

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

// Inspired by the dotnet Stopwatch class
// Provides a simple interface to get elapsed time in high resolution
export class Stopwatch {
	private startTime: bigint;
	private endTime: bigint | null = null;

	static startNew(): Stopwatch {
		const stopwatch = new Stopwatch();
		stopwatch.start();
		return stopwatch;
	}

	start(): void {
		this.startTime = process.hrtime.bigint();
		this.endTime = null;
	}

	reset(): void {
		this.startTime = process.hrtime.bigint();
		this.endTime = null;
	}

	stop(): void {
		this.endTime = process.hrtime.bigint();
	}

	elapsed(): ElapsedTime {
		return new ElapsedTime((this.endTime ?? process.hrtime.bigint()) - this.startTime);
	}

	getElapsedAndReset(): ElapsedTime {
		const elapsed = this.elapsed();
		this.reset();
		return elapsed;
	}
}

export class ElapsedTime {
	private readonly timeNanos: bigint;

	constructor(timeNanos: bigint) {
		this.timeNanos = timeNanos;
	}

	get totalNanoseconds(): bigint {
		return this.timeNanos;
	}
	get totalMicroseconds(): number {
		return Number(this.timeNanos / 1_000n);
	}
	get totalMilliseconds(): number {
		return Number(this.timeNanos / 1_000_000n);
	}
	get totalSeconds(): number {
		return Number(this.timeNanos / 1_000_000_000n);
	}
	get totalMinutes(): number {
		return this.totalSeconds / 60;
	}
	get totalHours(): number {
		return this.totalMinutes / 60;
	}
	get totalDays(): number {
		return this.totalHours / 24;
	}
	get nanoseconds(): number {
		return Number(this.timeNanos % 1_000n);
	}
	get microseconds(): number {
		return Number(this.timeNanos / 1_000n) % 1000;
	}
	get milliseconds(): number {
		return Number(this.timeNanos / 1_000_000n) % 1000;
	}
	get seconds(): number {
		return Number(this.timeNanos / 1_000_000_000n) % 60;
	}
	get minutes(): number {
		return this.totalMinutes % 60;
	}
	get hours(): number {
		return this.totalHours % 24;
	}
	get days(): number {
		return this.totalDays;
	}
}

export async function timePromise<T>(fn: () => Promise<T>): Promise<{ result: T; elapsed: ElapsedTime }> {
	const stopwatch = Stopwatch.startNew();
	const result = await fn();
	const elapsed = stopwatch.elapsed();
	return { result, elapsed };
}
