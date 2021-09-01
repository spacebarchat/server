import { performance } from "perf_hooks";
import { Guild, Relationship, RelationshipType } from "./entities";
import { User } from "./entities/User";
import { initDatabase } from "./util";

initDatabase().then(async (x) => {
	try {
		const user = await new User({
			guilds: [],
			discriminator: "1",
			username: "test",
			flags: "0",
			public_flags: "0",
			id: "0",
		}).save();

		user.relationships = [new Relationship({ type: RelationshipType.friends })];

		user.save();
	} catch (error) {
		console.error(error);
	}
});
