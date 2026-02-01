import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { ElapsedTime } from "./ElapsedTime";

describe("ElapsedTime", () => {
    test("should be able to be initialised", () => {
        const db = new ElapsedTime(0n);
        assert.equal(db != null, true);
    });

    test("should return correct total nanoseconds", () => {
        const db = new ElapsedTime(1234567890n);
        assert.equal(db.totalNanoseconds, 1234567890n);
    });

    test("should return correct total microseconds", () => {
        const db = new ElapsedTime(1234567890n);
        assert.equal(db.totalMicroseconds, 1234567);
    });

    test("should return correct total milliseconds", () => {
        const db = new ElapsedTime(1234567890n);
        assert.equal(db.totalMilliseconds, 1234);
    });

    test("should return correct total seconds", () => {
        const db = new ElapsedTime(5000000000n);
        assert.equal(db.totalSeconds, 5);
    });

    test("should return correct total minutes", () => {
        const db = new ElapsedTime(300000000000n); // 5 minutes
        assert.equal(db.totalMinutes, 5);
    });

    test("should return correct total hours", () => {
        const db = new ElapsedTime(7200000000000n); // 2 hours
        assert.equal(db.totalHours, 2);
    });

    test("should return correct total days", () => {
        const db = new ElapsedTime(172800000000000n); // 2 days
        assert.equal(db.totalDays, 2);
    });

    test("should return correct nanoseconds", () => {
        const db = new ElapsedTime(1234567890n);
        assert.equal(db.nanoseconds, 890);
    });

    test("should return correct microseconds", () => {
        const db = new ElapsedTime(1234567890n);
        assert.equal(db.microseconds, 567);
    });

    test("should return correct milliseconds", () => {
        const db = new ElapsedTime(1234567890n);
        assert.equal(db.milliseconds, 234);
    });

    test("should return correct seconds", () => {
        const db = new ElapsedTime(5000000000n);
        assert.equal(db.seconds, 5);
    });

    test("should return correct minutes", () => {
        const db = new ElapsedTime(300000000000n); // 5 minutes
        assert.equal(db.minutes, 5);
    });

    test("should return correct hours", () => {
        const db = new ElapsedTime(7200000000000n); // 2 hours
        assert.equal(db.hours, 2);
    });

    test("should return correct days", () => {
        const db = new ElapsedTime(172800000000000n); // 2 days
        assert.equal(db.days, 2);
    });
});
