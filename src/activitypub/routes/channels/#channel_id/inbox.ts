import { transformNoteToMessage } from "@spacebar/ap";
import { route } from "@spacebar/api";
import { Message, emitEvent } from "@spacebar/util";
import { APCreate, APNote } from "activitypub-types";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
const router = Router();

router.post("/", route({}), async (req: Request, res: Response) => {
	// TODO: check if the activity exists on the remote server
	// TODO: refactor
});

export default router;
