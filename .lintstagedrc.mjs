export default {
    "*.{j,t}s": [() => "npm run build:src:tsgo", "eslint --concurrency 4" /* sweet spot it seems */, "prettier --write"],
    "src/schemas/{*,**/*}.ts": [() => "npm run build:src:tsgo", () => "node scripts/schema.js", () => "node scripts/openapi.js", () => "git add assets/schemas.json assets/openapi.json"],
};
