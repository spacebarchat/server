import { test } from "node:test";
import assert from "node:assert/strict";
import { DateBuilder } from "./DateBuilder";

test("DateBuilder should be able to be initialised", () => {
    const db = new DateBuilder();
    assert.equal(db instanceof DateBuilder, true);
});

test("DateBuilder should be able to build current date", () => {
    const now = new Date();
    const db = new DateBuilder();
    const built = db.build();
    assert.equal(built.getFullYear(), now.getFullYear());
    assert.equal(built.getMonth(), now.getMonth());
    assert.equal(built.getDate(), now.getDate());
    assert.equal(built.getHours(), now.getHours());
    assert.equal(built.getMinutes(), now.getMinutes());
    assert.equal(built.getSeconds(), now.getSeconds());
});

test("DateBuilder should be able to build timestamp", () => {
    const now = new Date();
    const db = new DateBuilder();
    const built = db.buildTimestamp();
    assert.equal(built, now.getTime());
});

test("DateBuilder should be able to add days", () => {
    const db = new DateBuilder(new Date(2024, 0, 1)); // Jan 1, 2024
    db.addDays(30);
    const built = db.build();
    assert.equal(built.getFullYear(), 2024);
    assert.equal(built.getMonth(), 0); // January
    assert.equal(built.getDate(), 31); // January has 31 days
});

test("DateBuilder should be able to add months", () => {
    const db = new DateBuilder(new Date(2024, 0, 1)); // Jan 31, 2024
    db.addMonths(1);
    const built = db.build();
    assert.equal(built.getFullYear(), 2024);
    assert.equal(built.getMonth(), 1); // February
});

test("DateBuilder should be able to add years", () => {
    const db = new DateBuilder(new Date(2020, 1, 1));
    db.addYears(1);
    const built = db.build();
    assert.equal(built.getFullYear(), 2021);
    assert.equal(built.getMonth(), 1); // February
    assert.equal(built.getDate(), 1);
});

test("DateBuilder should be able to set date", () => {
    const db = new DateBuilder();
    db.withDate(2022, 12, 25); // Dec 25, 2022
    const built = db.build();
    assert.equal(built.getFullYear(), 2022);
    assert.equal(built.getMonth(), 11); // December
    assert.equal(built.getDate(), 25);
});

test("DateBuilder should be able to set time", () => {
    const db = new DateBuilder();
    db.withTime(15, 30, 45, 123); // 15:30:45.123
    const built = db.build();
    assert.equal(built.getHours(), 15);
    assert.equal(built.getMinutes(), 30);
    assert.equal(built.getSeconds(), 45);
    assert.equal(built.getMilliseconds(), 123);
});

test("DateBuilder should be able to set start of day", () => {
    const db = new DateBuilder(new Date(2024, 5, 15, 10, 20, 30, 456)); // June 15, 2024, 10:20:30.456
    db.atStartOfDay();
    const built = db.build();
    assert.equal(built.getFullYear(), 2024);
    assert.equal(built.getMonth(), 5); // June
    assert.equal(built.getDate(), 15);
    assert.equal(built.getHours(), 0);
    assert.equal(built.getMinutes(), 0);
    assert.equal(built.getSeconds(), 0);
    assert.equal(built.getMilliseconds(), 0);
});

test("DateBuilder should be able to set end of day", () => {
    const db = new DateBuilder(new Date(2024, 5, 15, 10, 20, 30, 456)); // June 15, 2024, 10:20:30.456
    db.atEndOfDay();
    const built = db.build();
    assert.equal(built.getFullYear(), 2024);
    assert.equal(built.getMonth(), 5); // June
    assert.equal(built.getDate(), 15);
    assert.equal(built.getHours(), 23);
    assert.equal(built.getMinutes(), 59);
    assert.equal(built.getSeconds(), 59);
    assert.equal(built.getMilliseconds(), 999);
});

test("DateBuilder should be able to chain methods", () => {
    const db = new DateBuilder(new Date(2024, 0, 1)); // Jan 1, 2024
    db.addDays(1).addMonths(1).addYears(1).withTime(12, 0, 0).atEndOfDay();
    const built = db.build();
    assert.equal(built.getFullYear(), 2025);
    assert.equal(built.getMonth(), 1); // March
    assert.equal(built.getDate(), 2);
    assert.equal(built.getHours(), 23);
    assert.equal(built.getMinutes(), 59);
    assert.equal(built.getSeconds(), 59);
    assert.equal(built.getMilliseconds(), 999);
});

test("DateBuilder should not mutate original date", () => {
    const original = new Date(2024, 0, 1); // Jan 1, 2024
    const db = new DateBuilder(original);
    db.addDays(10);
    const built = db.build();
    assert.equal(original.getFullYear(), 2024);
    assert.equal(original.getMonth(), 0); // January
    assert.equal(original.getDate(), 1); // Original date should remain unchanged
    assert.equal(built.getFullYear(), 2024);
    assert.equal(built.getMonth(), 0); // January
    assert.equal(built.getDate(), 11); // New date should be Jan 11, 2024
});

test("DateBuilder should handle leap years correctly", () => {
    const db = new DateBuilder(new Date(2020, 1, 29)); // Feb 29, 2020 (leap year)
    db.addYears(1);
    const built = db.build();
    assert.equal(built.getFullYear(), 2021);
    assert.equal(built.getMonth(), 2); // March
    assert.equal(built.getDate(), 1); // March 1, 2021 (not a leap year)
});

test("DateBuilder should handle month overflow correctly", () => {
    const db = new DateBuilder(new Date(2024, 0, 31)); // Jan 31, 2024
    db.addDays(1);
    const built = db.build();
    assert.equal(built.getFullYear(), 2024);
    assert.equal(built.getMonth(), 1); // February
    assert.equal(built.getDate(), 1); // Feb 29, 2024 (leap year)
});
