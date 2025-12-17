import { test } from "node:test";
import assert from "node:assert/strict";
import { TimeSpan } from "./Timespan";

test("TimeSpan should be able to be initialised", () => {
    const db = new TimeSpan();
    assert.equal(db != null, true);
});

test("TimeSpan should be able to be initialised with start and end", () => {
    const now = Date.now();
    const later = now + 5000;
    const ts = new TimeSpan(now, later);
    assert.equal(ts.start, now);
    assert.equal(ts.end, later);
});

test("TimeSpan should be able to be initialised with start and end (fromDates static method)", () => {
    const now = Date.now();
    const later = now + 5000;
    const ts = TimeSpan.fromDates(now, later);
    assert.equal(ts.start, now);
    assert.equal(ts.end, later);
});

test("TimeSpan should throw error if start is greater than end", () => {
    assert.throws(() => {
        new TimeSpan(2000, 1000);
    }, /Start time must be less than or equal to end time./);
});

test("TimeSpan should be able to return zero", () => {
    const ts = new TimeSpan();
    assert.equal(ts.totalMillis, 0);
});

test("TimeSpan should be able to return timespan from milliseconds", () => {
    const ts = TimeSpan.fromMillis(1000);
    assert.equal(ts.totalMillis, 1000);
    assert.equal(ts.totalSeconds, 1);
});

test("TimeSpan should be able to return timespan from seconds", () => {
    const ts = TimeSpan.fromSeconds(60);
    assert.equal(ts.totalMillis, 60000);
    assert.equal(ts.totalSeconds, 60);
    assert.equal(ts.totalMinutes, 1);
    assert.equal(ts.minutes, 1);
    assert.equal(ts.hours, 0);
    assert.equal(ts.days, 0);
});

test("TimeSpan should be pure", () => {
    const count = 10;
    const timestamps = [];
    for (let i = 0; i < count; i++) {
        timestamps.push(TimeSpan.fromMillis(8972347984));
        for (const ts2 of timestamps) {
            assert.equal(ts2.totalMillis, 8972347984);
            assert.equal(ts2.totalSeconds, 8972347);
            assert.equal(ts2.totalMinutes, 149539);
            assert.equal(ts2.totalHours, 2492);
            assert.equal(ts2.totalDays, 103);
            assert.equal(ts2.totalWeeks, 14);
            assert.equal(ts2.totalMonths, 3);
            assert.equal(ts2.totalYears, 0);

            assert.equal(ts2.millis, 984);
            assert.equal(ts2.seconds, 7);
            assert.equal(ts2.minutes, 19);
            assert.equal(ts2.hours, 20);
            assert.equal(ts2.days, 12);
            assert.equal(ts2.weekDays, 5);
            assert.equal(ts2.weeks, 1);
            assert.equal(ts2.months, 3);
            assert.equal(ts2.years, 0);
        }
    }
});

test("TimeSpan should be able to stringify", () => {
    const ts = TimeSpan.fromMillis(8972347984);
    assert.equal(ts.toString(), "3 months, 1 weeks, 5 days, 20 hours, 19 minutes, 7 seconds, 984 milliseconds");
    assert.equal(ts.toString(true), "3 months, 1 weeks, 5 days, 20 hours, 19 minutes, 7 seconds, 984 milliseconds");
    assert.equal(ts.toString(true, false), "3 months, 1 weeks, 5 days, 20 hours, 19 minutes, 7 seconds");
    assert.equal(ts.toString(false), "3 months, 12 days, 20 hours, 19 minutes, 7 seconds, 984 milliseconds");
    assert.equal(ts.toString(false, false), "3 months, 12 days, 20 hours, 19 minutes, 7 seconds");
});

test("TimeSpan should be able to shortStringify", () => {
    const ts = TimeSpan.fromMillis(8972347984);
    assert.equal(ts.toShortString(), "3mo1w5d20h19m7s984ms");
    assert.equal(ts.toShortString(true), "3mo1w5d20h19m7s984ms");
    assert.equal(ts.toShortString(true, false), "3mo1w5d20h19m7s");
    assert.equal(ts.toShortString(false), "3mo12d20h19m7s984ms");
    assert.equal(ts.toShortString(false, false), "3mo12d20h19m7s");
});

test("TimeSpan should be able to shortStringify with spaces", () => {
    const ts = TimeSpan.fromMillis(8972347984);
    assert.equal(ts.toShortString(undefined, undefined, true), "3mo 1w 5d 20h 19m 7s 984ms");
    assert.equal(ts.toShortString(true, undefined, true), "3mo 1w 5d 20h 19m 7s 984ms");
    assert.equal(ts.toShortString(true, false, true), "3mo 1w 5d 20h 19m 7s");
    assert.equal(ts.toShortString(false, undefined, true), "3mo 12d 20h 19m 7s 984ms");
    assert.equal(ts.toShortString(false, false, true), "3mo 12d 20h 19m 7s");
});

test("TimeSpan should be able to return start date", () => {
    const now = Date.now();
    const later = now + 5000;
    const ts = new TimeSpan(now, later);
    assert.equal(ts.startDate.getTime(), now);
});

test("TimeSpan should be able to return end date", () => {
    const now = Date.now();
    const later = now + 5000;
    const ts = new TimeSpan(now, later);
    assert.equal(ts.endDate.getTime(), later);
});
