import { User } from "../entities";

export class MinimalPublicUserDTO {
	avatar?: string | null;
	discriminator: string;
	id: string;
	public_flags: number;
	username: string;

	constructor(user: User) {
		this.avatar = user.avatar;
		this.discriminator = user.discriminator;
		this.id = user.id;
		this.public_flags = user.public_flags;
		this.username = user.username;
	}
}
