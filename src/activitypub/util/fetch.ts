import { DEFAULT_FETCH_OPTIONS } from "@spacebar/api";
import { OrmUtils } from "@spacebar/util";

export const fetchOpts = OrmUtils.mergeDeep(DEFAULT_FETCH_OPTIONS, {
	headers: {
		Accept: "application/activity+json",
	},
});
