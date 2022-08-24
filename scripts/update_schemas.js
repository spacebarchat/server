const path = require("path");
const fs = require("fs");
const { env } = require("process");
const { execSync } = require("child_process");
const { argv, stdout, exit } = require("process");

const { execIn, getLines, parts } = require("./utils");

execIn("node scripts/generate_schema.js", path.join("."));
