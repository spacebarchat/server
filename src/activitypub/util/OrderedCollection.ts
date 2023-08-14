import { APObject, APOrderedCollection } from "activitypub-types";
import { Request } from "express";

interface ActivityPubable {
	toAP(): APObject;
}

export const makeOrderedCollection = async <T extends ActivityPubable>(
	req: Request,
	id: string,
	getTotalElements: () => Promise<number>,
	getElements: (before?: string, after?: string) => Promise<T[]>,
): Promise<APOrderedCollection> => {
	const { page, min_id, max_id } = req.query;

	if (!page)
		return {
			"@context": "https://www.w3.org/ns/activitystreams",
			id: id,
			type: "OrderedCollection",
			first: `${id}?page=true`,
			last: `${id}?page=true&min_id=0`,
		};

	const after = min_id ? `${min_id}` : undefined;
	const before = max_id ? `${max_id}` : undefined;

	const elems = await getElements(before, after);

	const items = elems.map((elem) => elem.toAP());

	return {
		"@context": "https://www.w3.org/ns/activitystreams",
		id: `${id}?page=true`,
		type: "OrderedCollection",
		first: `${id}?page=true`,
		last: `${id}?page=true&min_id=0`,
		totalItems: await getTotalElements(),
		items: items,
	};
};
