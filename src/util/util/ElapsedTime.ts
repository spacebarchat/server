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

	toString(): string {
		// Format: "DD.HH:MM:SS.mmmuuuNNN", with days being optional
		const daysPart = Math.floor(this.days) > 0 ? `${Math.floor(this.days)}.` : "";
		const hoursPart = Math.floor(this.hours).toString().padStart(2, "0");
		const minutesPart = Math.floor(this.minutes).toString().padStart(2, "0");
		const secondsPart = Math.floor(this.seconds).toString().padStart(2, "0");
		const millisecondsPart = Math.floor(this.milliseconds).toString().padStart(3, "0");
		const microsecondsPart = Math.floor(this.microseconds).toString().padStart(3, "0");
		const nanosecondsPart = Math.floor(this.nanoseconds).toString().padStart(3, "0");

		return `${daysPart}${hoursPart}:${minutesPart}:${secondsPart}.${millisecondsPart}${microsecondsPart}${nanosecondsPart}`;
	}
}