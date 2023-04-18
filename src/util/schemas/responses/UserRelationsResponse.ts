import { User } from "@spacebar/util";

export type UserRelationsResponse = (Pick<User, "id"> &
	Pick<User, "username"> &
	Pick<User, "discriminator"> &
	Pick<User, "avatar"> &
	Pick<User, "public_flags">)[];
