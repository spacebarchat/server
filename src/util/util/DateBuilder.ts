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

export class DateBuilder {
	private date: Date;
	// constructors
	constructor(date = new Date()) {
		if (!(date instanceof Date)) {
			throw new Error("Invalid date object.");
		}
		this.date = new Date(date.getTime()); // Create a copy to avoid mutating the original date
	}

	// methods
	addYears(years: number) {
		this.date.setFullYear(this.date.getFullYear() + years);
		return this;
	}

	addMonths(months: number) {
		this.date.setMonth(this.date.getMonth() + months);
		return this;
	}

	addDays(days: number) {
		this.date.setDate(this.date.getDate() + days);
		return this;
	}

	addHours(hours: number) {
		this.date.setHours(this.date.getHours() + hours);
		return this;
	}

	addMinutes(minutes: number) {
		this.date.setMinutes(this.date.getMinutes() + minutes);
		return this;
	}

	addSeconds(seconds: number) {
		this.date.setSeconds(this.date.getSeconds() + seconds);
		return this;
	}

	addMillis(millis: number) {
		this.date.setTime(this.date.getTime() + millis);
		return this;
	}

	withDate(year: number, month: number, day: number | undefined) {
		this.date.setFullYear(year, month - 1, day); // month is 0-based
		return this;
	}

	withTime(hour: number, minute = 0, second = 0, millisecond = 0) {
		this.date.setHours(hour, minute, second, millisecond);
		return this;
	}

	atStartOfDay() {
		this.date.setHours(0, 0, 0, 0);
		return this;
	}

	atEndOfDay() {
		this.date.setHours(23, 59, 59, 999);
		return this;
	}

	build() {
		return new Date(this.date.getTime()); // Return a copy to avoid external mutation
	}

	buildTimestamp() {
		return this.date.getTime();
	}
}
