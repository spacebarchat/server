import jwt from "jsonwebtoken";

const algorithm = "HS256";
const iat = Math.floor(Date.now() / 1000);

// @ts-ignore
const token = jwt.sign({ id: "311129357362135041" }, "secret", {
	algorithm,
});
console.log(token);

const decoded = jwt.verify(token, "secret", { algorithms: [algorithm] });
console.log(decoded);
