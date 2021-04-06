import { UserModel } from "fosscord-server-util";
import { HTTPError } from "lambert-server";

export const PublicUserProjection = {
	username: true,
	discriminator: true,
	id: true,
	public_flags: true,
	avatar: true,
};

export async function getPublicUser(user_id: string, additional_fields?: any) {
	const user = await UserModel.findOne(
		{ id: user_id },
		{
			...PublicUserProjection,
			...additional_fields,
		}
	)
		.lean()
		.exec();
	if (!user) throw new HTTPError("User not found", 404);
	return user;
}
