import { Request } from "express";
import { Application, User } from "../entities";

export async function createAppBotUser(app: Application, req: Request) {
	const user = await User.register({
		username: app.name,
		password: undefined,
		id: app.id,
		req,
	});

	user.id = app.id;
	user.premium_since = new Date();
	user.bot = true;

	await user.save();

	// flags is NaN here?
	app.assign({ bot: user, flags: app.flags || 0 });

	await app.save();

	return user;
}
