import { PublicUser, RelationshipType } from "../../entities";

export interface UserRelationshipsResponse {
	id: string;
	type: RelationshipType;
	nickname: null;
	user: PublicUser;
}
