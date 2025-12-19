import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig } from "eslint/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default defineConfig([
    {
        ignores: ["**/node_modules", "**/dist", "**/README.md", "**/COPYING", "**/scripts/", "**/assets", "**/extra/"],
    },
    ...compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended"),
    {
        files: ["**/*.ts"],
        plugins: {
            "@typescript-eslint": typescriptEslint,
        },

        languageOptions: {
            globals: {
                ...globals.node,
            },

            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                project: "./tsconfig.json",
            },
        },

        rules: {
            "no-mixed-spaces-and-tabs": "off",
            "@typescript-eslint/no-inferrable-types": "off", // Required by typeorm
            "@typescript-eslint/no-var-requires": "off", // Sometimes requred by typeorm to resolve circular deps
            "@typescript-eslint/no-require-imports": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-deprecated": "warn",
        },
    },
    {
        files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
        extends: typescriptEslint.configs?.disableTypeChecked ? [typescriptEslint.configs.disableTypeChecked] : [],
    },
]);
