import { route } from "@fosscord/api";
import { Config, random, Rights, ValidRegistrationToken } from "@fosscord/util";
import { Request, Response, Router } from "express";


const router: Router = Router();
export default router;

router.get("/", route({ right: "OPERATOR" }), async (req: Request, res: Response) => {
    let count = (req.query.count as unknown) as number ?? 1;
    let tokens: string[] = [];
    let dbtokens: ValidRegistrationToken[] = [];
    for(let i = 0; i < count; i++) {
        let token = random((req.query.length as unknown as number) ?? 255);
        let vrt = new ValidRegistrationToken();
        vrt.token = token;
        dbtokens.push(vrt);
        if(req.query.include_url == "true") token = `${Config.get().general.publicUrl}/register?token=${token}`;
        tokens.push(token);
    }
    await ValidRegistrationToken.save(dbtokens, { chunk: 1000, reload: false, transaction: false });
    
    if(req.query.plain == "true") {
        if(count == 1) res.send(tokens[0]);
        else res.send(tokens.join("\n"));
    }
    else if(count == 1) res.json({ token: tokens[0] });
    else res.json({ tokens });
});