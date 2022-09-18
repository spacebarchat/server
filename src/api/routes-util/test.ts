import { Config, Release } from "@fosscord/util";
import { Request, Response, Router } from "express";
import { route } from "..";

export default (path: string, router: Router) => {
	router.get(path, route({}), async (req: Request, res: Response) => {
		router.get("/", route({}), async (req: Request, res: Response) => {
			res.json({ok:true});
		});
	});
};

