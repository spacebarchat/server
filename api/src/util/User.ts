import { toObject, User, PublicUserProjection } from "@fosscord/util";
import { HTTPError } from "lambert-server";

export { PublicUserProjection };

export async function getPublicUser(user_id: string, additional_fields?: any) {
	const user = await User.findOneOrFail(
		{ id: user_id },
		{
			...PublicUserProjection,
			...additional_fields
		}
	);
	if (!user) throw new HTTPError("User not found", 404);
	return user;
}
