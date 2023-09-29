import { APFollow } from "activitypub-types";

export type APFollowWithInvite = APFollow & {
	invite: string;
};
