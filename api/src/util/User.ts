import { toObject, UserModel, PublicUserProjection } from "@fosscord/util";
import { HTTPError } from "lambert-server";

export { PublicUserProjection };

export async function getPublicUser(user_id: string, additional_fields?: any) {
	const user = await UserModel.findOne(
		{ id: user_id },
		{
			...PublicUserProjection,
			...additional_fields
		}
	).exec();
	if (!user) throw new HTTPError("User not found", 404);
	return toObject(user);
}
