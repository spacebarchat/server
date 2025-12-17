/**
 * Represents a timespan with a start and end time.
 */
export class TimeSpan {
	public readonly start: number;
	public readonly end: number;
	// constructors
	constructor(start = Date.now(), end = Date.now()) {
		if (start > end) {
			throw new Error("Start time must be less than or equal to end time.");
		}
		this.start = start;
		this.end = end;
	}

	static fromDates(startDate: number, endDate: number) {
		return new TimeSpan(startDate, endDate);
	}

	static fromMillis(millis: number) {
		return new TimeSpan(0, millis);
	}

	static fromSeconds(seconds: number) {
		return TimeSpan.fromMillis(seconds * 1000);
	}

	// methods
	get totalMillis() {
		return this.end - this.start;
	}

	get millis() {
		return Math.floor(this.totalMillis % 1000);
	}

	get totalSeconds() {
		return Math.floor(this.totalMillis / 1000);
	}

	get seconds() {
		return Math.floor((this.totalMillis / 1000) % 60);
	}

	get totalMinutes() {
		return Math.floor(this.totalMillis / 1000 / 60);
	}

	get minutes() {
		return Math.floor((this.totalMillis / 1000 / 60) % 60);
	}

	get totalHours() {
		return Math.floor(this.totalMillis / 1000 / 60 / 60);
	}

	get hours() {
		return Math.floor((this.totalMillis / 1000 / 60 / 60) % 24);
	}

	get totalDays() {
		return Math.floor(this.totalMillis / 1000 / 60 / 60 / 24);
	}

	get days() {
		return Math.floor((this.totalMillis / 1000 / 60 / 60 / 24) % 30.44); // Average days in a month
	}

	get weekDays() {
		return Math.floor((this.totalMillis / 1000 / 60 / 60 / 24) % 7);
	}

	get totalWeeks() {
		return Math.floor(this.totalMillis / 1000 / 60 / 60 / 24 / 7);
	}

	get weeks() {
		return Math.floor((this.totalMillis / 1000 / 60 / 60 / 24 / 7) % 4.345); // Average weeks in a month
	}

	get totalMonths() {
		return Math.floor(this.totalMillis / 1000 / 60 / 60 / 24 / 30.44); // Average days in a month
	}

	get months() {
		return Math.floor((this.totalMillis / 1000 / 60 / 60 / 24 / 30.44) % 12); // Average days in a month
	}

	get totalYears() {
		return Math.floor(this.totalMillis / 1000 / 60 / 60 / 24 / 365.25); // Average days in a year
	}

	get years() {
		return Math.floor(this.totalMillis / 1000 / 60 / 60 / 24 / 365.25); // Average days in a year
	}

	toString(includeWeeks = true, includeMillis = true) {
		const parts = [];
		if (this.totalYears >= 1) parts.push(`${this.totalYears} years`);
		if (this.totalMonths >= 1) parts.push(`${this.months} months`);
		if (includeWeeks && this.totalWeeks >= 1) parts.push(`${this.weeks} weeks`);
		if (this.totalDays >= 1) parts.push(`${includeWeeks ? this.weekDays : this.days} days`);
		if (this.totalHours >= 1) parts.push(`${this.hours} hours`);
		if (this.totalMinutes >= 1) parts.push(`${this.minutes} minutes`);
		if (this.totalSeconds >= 1) parts.push(`${this.seconds} seconds`);
		if (includeMillis) parts.push(`${this.millis} milliseconds`);
		return parts.join(", ");
	}

	toShortString(includeWeeks = true, includeMillis = true, withSpaces = false) {
		const parts = [];
		if (this.totalYears >= 1) parts.push(`${this.totalYears}y`);
		if (this.totalMonths >= 1) parts.push(`${this.months}mo`);
		if (includeWeeks && this.totalWeeks >= 1) parts.push(`${this.weeks}w`);
		if (this.totalDays >= 1) parts.push(`${includeWeeks ? this.weekDays : this.days}d`);
		if (this.totalHours >= 1) parts.push(`${this.hours}h`);
		if (this.totalMinutes >= 1) parts.push(`${this.minutes}m`);
		if (this.totalSeconds >= 1) parts.push(`${this.seconds}s`);
		if (includeMillis) parts.push(`${this.millis}ms`);
		return parts.join(withSpaces ? " " : "");
	}

	get startDate() {
		return new Date(this.start);
	}

	get endDate() {
		return new Date(this.end);
	}
}
