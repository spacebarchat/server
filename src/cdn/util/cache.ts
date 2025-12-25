import { NextFunction, Response, Request } from "express";

export function cache(req: Request, res: Response, next: NextFunction) {
    const durationInSeconds = 21600; // 6 hours
    res.set("Cache-Control", `public, max-age=${durationInSeconds}, s-maxage=${durationInSeconds}, immutable`);
    next();
}
