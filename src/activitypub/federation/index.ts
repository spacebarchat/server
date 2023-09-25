/**
 * To be injected into API
 * Responsible for dispatching activitypub events to external instances
 */

import { AP } from "activitypub-core-types";
import { federationQueue } from "./queue";

export * from "./OrderedCollection";
export * from "./transforms";
export * from "./utils";

export class Federation {
	static async distribute(activity: AP.Activity) {
		await federationQueue.distribute(activity);
	}
}
