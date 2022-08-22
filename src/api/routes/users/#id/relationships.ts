import { Router, Request, Response } from "express";
import { User } from "@fosscord/util";
import { route } from "@fosscord/api";

const router: Router = Router();

export interface UserRelationsResponse {
	object: {
		id?: string,
		username?: string,
		avatar?: string, 
		discriminator?: string, 
		public_flags?: number
	}
}


router.get("/", route({ test: { response: { body: "UserRelationsResponse" } } }), async (req: Request, res: Response) => {
	let mutual_relations: object[] = [];
    const requested_relations = await User.findOneOrFail({
		where: { id: req.params.id },
		relations: ["relationships"]
	});
    const self_relations = await User.findOneOrFail({
		where: { id: req.user_id },
		relations: ["relationships"]
	});
	
    for(const rmem of requested_relations.relationships) {
		for(const smem of self_relations.relationships)
		if (rmem.to_id === smem.to_id && rmem.type === 1 && rmem.to_id !== req.user_id) {
			let relation_user = await User.getPublicUser(rmem.to_id)

			mutual_relations.push({id: relation_user.id, username: relation_user.username, avatar: relation_user.avatar, discriminator: relation_user.discriminator, public_flags: relation_user.public_flags})
		}
	}

	res.json(mutual_relations)
});

export default router;
