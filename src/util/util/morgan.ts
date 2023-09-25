import Express from "express";
import morgan from "morgan";
import { red } from "picocolors";

let HAS_WARNED = false;
export const setupMorganLogging = (app: Express.Application) => {
	const logRequests = process.env["LOG_REQUESTS"] != undefined;
	if (!logRequests) return;

	if (!HAS_WARNED)
		console.log(
			red(
				`Warning: Request logging is enabled! This will spam your console!\nTo disable this, unset the 'LOG_REQUESTS' environment variable!`,
			),
		);

	HAS_WARNED = true;

	app.use(
		morgan("combined", {
			skip: (req, res) => {
				let skip = !(
					process.env["LOG_REQUESTS"]?.includes(
						res.statusCode.toString(),
					) ?? false
				);
				if (process.env["LOG_REQUESTS"]?.charAt(0) == "-") skip = !skip;
				return skip;
			},
		}),
	);
};
