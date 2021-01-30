import jwt from "jsonwebtoken";

// console.log(jwt.sign("test", "test"));

jwt.verify(`${"2WmFS_EAdYFCBOFM9pVPo9g4bpuI2I9U_JGTCfrx7Tk".repeat(1000000)}`, "test", (err, decoded) => {
	if (err) console.error(err);
	console.log(decoded);
});
