/**
 * To be injected into API
 * Responsible for dispatching activitypub events to external instances
 */

import { APActivity } from "activitypub-types";
import { federationQueue } from "./queue";

export * from "./OrderedCollection";
export * from "./transforms";
export * from "./utils";

export class Federation {
	static async distribute(activity: APActivity) {
		await federationQueue.distribute(activity);
	}
}
