import { APOrderedCollection, CollectionCurrentField } from "activitypub-types";
import { ACTIVITYSTREAMS_CONTEXT } from "./utils";

export const makeOrderedCollection = async <
	T extends CollectionCurrentField,
>(opts: {
	page: boolean;
	min_id?: string;
	max_id?: string;
	id: string;
	getTotalElements: () => Promise<number>;
	getElements: (before?: string, after?: string) => Promise<T[]>;
}): Promise<APOrderedCollection> => {
	const { page, min_id, max_id, id, getTotalElements, getElements } = opts;

	if (!page)
		return {
			"@context": ACTIVITYSTREAMS_CONTEXT,
			id: id,
			type: "OrderedCollection",
			totalItems: await getTotalElements(),
			first: new URL(`${id}?page=true`),
			last: new URL(`${id}?page=true&min_id=0`),
		};

	const after = min_id ? `${min_id}` : undefined;
	const before = max_id ? `${max_id}` : undefined;

	const elems = await getElements(before, after);

	// TODO: we need to specify next/prev props
	// and should probably let the caller of this function specify what they are
	// along with first/last
	return {
		"@context": ACTIVITYSTREAMS_CONTEXT,
		id: `${id}?page=true`,
		type: "OrderedCollection",
		first: new URL(`${id}?page=true`),
		last: new URL(`${id}?page=true&min_id=0`),
		totalItems: await getTotalElements(),
		orderedItems: elems,
	};
};
