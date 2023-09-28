import { APActivity } from "activitypub-types";
import { Column, Entity } from "typeorm";
import { Config } from "..";
import { BaseClass } from "./BaseClass";

@Entity("federation_activities")
export class FederationActivity extends BaseClass {
	@Column({ type: "simple-json" })
	data: APActivity;

	toJSON(): APActivity {
		const { host } = Config.get().federation;
		return {
			id: `https://${host}/federation/activities/${this.id}`,
			...this.data,
		};
	}
}
