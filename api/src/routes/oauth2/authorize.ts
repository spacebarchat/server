import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import { Application, User, Member, Role, Guild } from "@fosscord/util";
const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	
    const { client_id, scope } = req.query;

    const application = await Application.findOneOrFail({ where: `"id" = ${client_id}` })

    const user = await User.findOneOrFail({ where: `"id" = ${req.user_id}`})

    const bot = await User.findOneOrFail({ where: `"id" = ${client_id}`})
    
    const guilds = await Member.find({ relations: ["guild"], where: { id: req.user_id } });

    let permissionGuilds = []

    for (const guild of guilds.map((x) => x.guild)) {

        const guild_id = guild.id

        let permissions: number = 0;
		
        const member = await Member.findOneOrFail({
				where: { id: req.user_id, guild_id },
				relations: ["roles"]
			})

        for (const role of member.roles) {
            permissions += Number(role.permissions)
        }

        if (guild.owner_id == req.user_id) {
            permissions += 2196771451326;
        }

        permissionGuilds.push(Object.assign({ ...guild, permissions: `${permissions}`}))
    }

	res.send({ application: application, user: user, authorized: false, bot: bot, guilds: permissionGuilds});
});

export interface AuthorizedSchema {
	authorize: boolean;
    guild_id: string;
    permissions: string;
}

router.post("/", route({}), async (req: Request, res: Response) => {

    //TODO: captcha

    var body = req.body as AuthorizedSchema;

    const { client_id, scope } = req.query;

    if (scope == "bot") {
        await Member.addToGuild(client_id as string, body.guild_id);

        const application = await Application.findOneOrFail({ where: `"id" = ${client_id}` })

        const role = new Role({
            guild_id: body.guild_id,
            color: 0,
            hoist: false,
            mentionable: false,
            name: application.name,
            managed: false,
            permissions: body.permissions,
            position: false,
        })

        await role.save()

        await Member.addRole(client_id as string, body.guild_id, role.id)
    }

    res.send({ location: `${req.get("Origin")}/oauth2/authorized`});
});

export default router;
