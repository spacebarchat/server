module.exports = {
    "*.{j,t}s": ["eslint", "prettier --write"],
    "src/schemas/{*,**/*}.ts": [() => "tsc -b -v", () => "node scripts/schema.js", () => "node scripts/openapi.js"],
};
