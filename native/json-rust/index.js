const path = require("path");

let addon;
try {
    addon = require(path.join(__dirname, "..", "dist", "json-rust", "index.node"));
} catch (e) {
    console.warn("Failed to load Rust JSON addon, falling back to JS implementation:", e.message);
}

module.exports = addon || {};
