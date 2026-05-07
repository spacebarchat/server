import { describe, test } from "node:test";
import assert from "node:assert";
import { normalizeCategoryLocalizations } from "./CategoryLocalizations";

describe("normalizeCategoryLocalizations", () => {
    test("preserves string localization maps", () => {
        assert.deepStrictEqual(normalizeCategoryLocalizations({ de: "Gaming", fr: "Jeux" }), { de: "Gaming", fr: "Jeux" });
    });

    test("normalizes non-object category localization values to an empty map", () => {
        assert.deepStrictEqual(normalizeCategoryLocalizations(null), {});
        assert.deepStrictEqual(normalizeCategoryLocalizations("Gaming"), {});
        assert.deepStrictEqual(normalizeCategoryLocalizations(["Gaming"]), {});
    });

    test("drops non-string localization values", () => {
        assert.deepStrictEqual(normalizeCategoryLocalizations({ de: 123, fr: null, ru: "Игры" }), { ru: "Игры" });
    });
});
