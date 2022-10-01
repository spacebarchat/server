<p align="center">
	<img width="100" src="https://slowcord.understars.dev/icons/992709344367829040/b58b15cdeee1dddcd3769f78217aca1a.webp?size=96"/>
</p>
<h1 align="center">Slowcord</h1>

### Notice: **DO NOT** ask for support regarding Slowcord in the Fosscord support server.

This branch hosts the source for [Slowcord](https://slowcord.understars.dev). It is *vastly* different than standard Fosscord, with many new features, bug fixes and improvements.

If you would like to host Slowcord yourself, you should know:  
* **You will not receive support**. I am a university student, who works on this in my free time because it's fun. What is not fun is helping people with the same 5 problems.
* **Slowcord is configured in a very specific way**. There exists parts of the codebase which assume things about your system's configuration which may not be documented here. You **will** need to edit things here to get them to work.
* **There is no voice/video server, and no admin dashboard** yet. There do not exist on any Fosscord instance.

Alright, now onto the guide.  
## The Guide
The guide assumes:
* You're using Ubuntu
* You've got a domain name, and you are NOT using ngrok, cloudflare tunnels, hamachi.
* With said domain name, you've got DNS records pointing it to your server

### Installing Slowcord

```sh
# deps make, git, gcc, g++, etc
sudo apt install build-essential

# deps for canvas npm package
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

You also need Node, at least version 16. Just go with the latest. It's easiest if you use [node version manager](https://github.com/nvm-sh/nvm).

Now to install Slowcord:
```sh
# TODO: once `slowcord-refactor` has been merged into `slowcord`, replace this line.
git clone -b slowcord-refactor https://github.com/MaddyUnderStars/fosscord-server.git
cd fosscord-server
npm i
npm run build

# you may now use this last command to start the server
npm run start
```

You should probably run the start command in a `screen`, or with systemd, instead.

### Installing Nginx, getting an SSL cert
```sh
sudo apt install nginx certbot python3-certbot-nginx
```

Copy the file at `fosscord-server/src-slowcord/nginx/fosscord` to `/etc/nginx/sites-enabled/fosscord` and edit it how you see fit. That is:
* Edit the `server_name`
* If you're not using the Slowcord login server, remove the `location` block related to it
* Remove the Slowcord SSL cert stuff, you'll generate your own later.
* Also edit the `$host = whatever` line at the bottom., and the server name in that block.

Now, generate an SSL cert with certbot:
```sh
certbot --nginx
```
It'll ask you a bunch of questions, generate a cert, and edit your config to match.
You may need to run `sudo systemctl restart nginx`.

At this point, you can probably start Slowcord using `npm run start` in the project root.

### Configuration
Almost all config is done through the `config` table of your database. The values are either self explainatory, or have documentation on https://docs.fosscord.com. Slowcord's config provides sane defaults for most things, but you may want to edit:
* `cdn_endpointPublic`: The CDN url given to clients. Change this to your domain. Protocol is `https`, assuming you've got SSL.
* `gateway_endpointPublic` See above, but for the gateway. Protocol is `wss`, with SSL.
* `security_defaultRights` The default rights value is discord.com-like by default. Check the fosscord docs for info about rights.
* `guild_defaultFeatures_X` The default features of a guild. Used to grant premium features to all guilds on Slowcord. You may want to do the same. [List of guild features](https://gist.github.com/Techy/ecc60b12e94f8fc8185f09b82aa91dd2). This value is an array, `X` is a number, starting a `0`.
* `security_captcha_enabled`, and related values.

The `.env` file in the project root doesn't have any defaults, but I recommend you use this:
```
THREADS=1
DATABASE=YOUR DATABASE CONNECTION STRING.
```

Not providing a `DATABASE` will set Slowcord to use SQlite, which is not very performant at scale. I recommend Mariadb or Postgresql, as they are quite well-used in the Fosscord community.

### Some useful scripts
* `npm run generate:client`. Downloads the full Discord.com web client and patches it. Edit the script to change what the patches do, such as changing `Discord` -> `Slowcord` and removing Nitro references.
* `npm run generate:rights`. Shows all-rights values and Discord.com-like rights values.
* `npm run generate:schema`. Generates a new `assets/schemas.json` file. If you edit any schemas, you will need to rerun this.

### Slowcord additional services
If you want to run the login server for Discord oauth, use the bot, or use the status reporting service? Just look around in the repo. It's 10:30pm, I'm too tired. Theres example .env files, and you can always look at the codebase to see what they do. They're pretty self explanatory though.

Thanks.