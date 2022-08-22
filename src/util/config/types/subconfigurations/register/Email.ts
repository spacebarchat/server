export class EmailConfiguration {
    required: boolean = false;
    allowlist: boolean = false;
    blocklist: boolean = true;
    domains: string[] = [];// TODO: efficiently save domain blocklist in database
    // domains: fs.readFileSync(__dirname + "/blockedEmailDomains.txt", { encoding: "utf8" }).split("\n"),
}