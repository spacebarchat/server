import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig } from "eslint/config";
import nodeImport from "eslint-plugin-node-import";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default defineConfig([
    {
        ignores: ["./node_modules", "./dist", "**/README.md", "**/COPYING", "./scripts/", "./assets/", "./extra/", "./files/"],
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
            "array-callback-return": "error",
            "no-constructor-return": "error",
            "no-duplicate-imports": "error",
            "no-promise-executor-return": ["error", { allowVoid: true }],
            "no-self-compare": "error",
            "no-template-curly-in-string": "error",
            "no-unmodified-loop-condition": "error",
            "no-unreachable-loop": "error",
            "arrow-body-style": ["error", "as-needed"],
            "block-scoped-var": "error",
            // some day...
            // "camelcase": ["error", {
            //     properties: "never", //schemas
            //     ignoreImports: true
            // }],
            // "consistent-return": "error",
            // "sort-imports": ["error", {}],
            "default-case": "error",
            "default-case-last": "error",
            "yoda": "error",
            // unsure what the defaults are here, but we want them to error
            "for-direction": "error",
            "constructor-super": "error",
            "getter-return": "error",
            "no-restricted-imports": [
                "error",
                { name: "@spacebar/api*", message: "Did you mean @spacebar/api?" },
                { name: "@spacebar/bundle*", message: "Did you mean @spacebar/bundle?" },
                { name: "@spacebar/cdn*", message: "Did you mean @spacebar/cdn?" },
                { name: "@spacebar/connections*", message: "Did you mean @spacebar/connections?" },
                { name: "@spacebar/gateway*", message: "Did you mean @spacebar/gateway?" },
                { name: "@spacebar/schemas*", message: "Did you mean @spacebar/schemas?" },
                { name: "@spacebar/util*", message: "Did you mean @spacebar/util?" },
                { name: "node:console" },
            ],
        },
    },
    {
        files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
        extends: typescriptEslint.configs?.disableTypeChecked ? [typescriptEslint.configs.disableTypeChecked] : [],
    },
    {
        plugins: { "node-import": nodeImport },
        rules: {
            "node-import/prefer-node-protocol": "error",
        },
    },
]);
