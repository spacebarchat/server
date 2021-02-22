import { UserModel } from "fosscord-server-util";
import { HTTPError } from "lambert-server";

export async function getPublicUser(user_id: bigint, additional_fields?: any) {
	const user = await UserModel.findOne(
		{ id: user_id },
		{
			username: true,
			discriminator: true,
			id: true,
			public_flags: true,
			avatar: true,
			...additional_fields,
		}
	).exec();
	if (!user) throw new HTTPError("User not found", 404);
	return user;
}
