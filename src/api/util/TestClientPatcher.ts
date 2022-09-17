import path from "path";
import fs from "fs";
import { formatFile } from "@fosscord/util";

console.log('[TestClient] Loading private assets...');

const privateAssetsRoot = path.join(__dirname, "..", "..", "..", "assets", "private");
const iconsRoot = path.join(privateAssetsRoot, "icons");
const icons = new Map<string, Buffer>();

fs.readdirSync(iconsRoot).forEach(file => {
    const fileName = path.basename(file);
    //check if dir
    if(fs.lstatSync(path.join(iconsRoot, file)).isDirectory()){
        return;
    }
    icons.set(fileName,fs.readFileSync(path.join(iconsRoot,file)) as Buffer);
});

fs.readdirSync(path.join(iconsRoot, "custom")).forEach(file => {
    const fileName = path.basename(file);
    if(fs.lstatSync(path.join(iconsRoot,"custom", file)).isDirectory()){
        return;
    }
    icons.set(fileName,fs.readFileSync(path.join(iconsRoot,"custom",file)) as Buffer);
});

console.log('[TestClient] Patcher ready!');

export function patchFile(filePath: string, content: string): string {
    //console.log(`[TestClient] Patching ${filePath}`);
    let startTime = Date.now();
    
    content = formatFile(filePath, content);
    //content = prettier(filePath, content);
    content = autoPatch(filePath, content);

    console.log(`[TestClient] Patched ${filePath} in ${Date.now() - startTime}ms`);
    return content;
}
function prettier(filePath: string, content: string): string{
    let prettier = require("prettier");
    let parser;
    filePath = filePath.toLowerCase().split('?')[0];
    if(filePath.endsWith(".js")) {
        parser = "babel";
    } else if (filePath.endsWith(".ts")){
        parser = "typescript";
    } else if(filePath.endsWith(".css")){
        parser = "css";
    } else if(filePath.endsWith(".json")){
        parser = "json";
    }
    else {
        console.log(`[TestClient] Skipping prettier for ${filePath}, unknown file type!`);
        return content;
    }
    content = prettier.format(content, {
        tabWidth: 4,
        useTabs: true,
        printWidth: 140,
        trailingComma: "none",
        parser
    });
    console.log(`[TestClient] Prettified ${filePath}!`);
    return content;
}

function autoPatch(filePath: string, content: string): string {
    //patches
    content = content.replaceAll('isDiscordGatewayPlaintextSet = function () {' , 'isDiscordGatewayPlaintextSet = function () { return window.GLOBAL_ENV.PLAINTEXT_GATEWAY;');

    //remove nitro references
    content = content.replace(/Discord Nitro/g, "Fosscord Premium");
    content = content.replace(/"Nitro"/g, "\"Premium\"");
    content = content.replace(/Nitro /g, "Premium ");
    content = content.replace(/ Nitro/g, " Premium");
    content = content.replace(/\[Nitro\]/g, "[Premium]");
    content = content.replace(/\*Nitro\*/g, "*Premium*");
    content = content.replace(/\"Nitro \. /g, "\"Premium. ");

    //remove discord references
    content = content.replace(/ Discord /g, " Fosscord ");
    content = content.replace(/Discord /g, "Fosscord ");
    content = content.replace(/ Discord/g, " Fosscord");
    content = content.replace(/Discord Premium/g, "Fosscord Premium");
    content = content.replace(/Discord Nitro/g, "Fosscord Premium");
    content = content.replace(/Discord's/g, "Fosscord's");
    //content = content.replace(/DiscordTag/g, "FosscordTag");
    content = content.replace(/\*Discord\*/g, "*Fosscord*");

    //server -> guild
    content = content.replace(/"Server"/g, "\"Guild\"");
    content.replaceAll("server.\"","guild.\"");
    content.replaceAll(" server "," guild ");
    content.replaceAll(" Server "," Guild ");
    content.replaceAll("\"Server","\"Guild");

    //change some vars
    content = content.replace('dsn: "https://fa97a90475514c03a42f80cd36d147c4@sentry.io/140984"', "dsn: (/true/.test(localStorage.sentryOptIn)?'https://6bad92b0175d41a18a037a73d0cff282@sentry.thearcanebrony.net/12':'')");
    content = content.replace('t.DSN = "https://fa97a90475514c03a42f80cd36d147c4@sentry.io/140984"', "t.DSN = (/true/.test(localStorage.sentryOptIn)?'https://6bad92b0175d41a18a037a73d0cff282@sentry.thearcanebrony.net/12':'')");
    content = content.replace('--brand-experiment: hsl(235, calc(var(--saturation-factor, 1) * 85.6%), 64.7%);', '--brand-experiment: hsl(var(--brand-hue), calc(var(--saturation-factor, 1) * 85.6%), 50%);');
    content = content.replaceAll(/--brand-experiment-(\d{1,4}): hsl\(235/g, '--brand-experiment-\$1: hsl(var(--brand-hue)')

    //logos
    content = content.replace(/d: "M23\.0212.*/, `d: "${icons.get("homeIcon.path")!.toString()}"`);
    content = content.replace('width: n, height: o, viewBox: "0 0 28 20"', 'width: 48, height: 48, viewBox: "0 0 48 48"');

    
    //save some time on load resolving asset urls...
    content = content.replaceAll('e.exports = n.p + "', 'e.exports = "/assets/');
    content = content.replaceAll('e.exports = r.p + "', 'e.exports = "/assets/');
    

    //console.log(`[TestClient] Autopatched ${path.basename(filePath)}!`);
    return content;
}