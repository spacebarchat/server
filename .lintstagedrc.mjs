export default {
    "*.{j,t}s": ["eslint --concurrency 4" /* sweet spot it seems */, "prettier --write"],
    "src/schemas/{*,**/*}.ts": [() => "tsc -b -v", () => "node scripts/schema.js", () => "node scripts/openapi.js", () => "git add assets/schemas.json assets/openapi.json"],
};
