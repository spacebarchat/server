import path from "path";
import fs from "fs";
import { Paths, TestClientPaths } from "@fosscord/util";


function readAssets(): Map<string, Buffer> {
    const icons = new Map<string, Buffer>();
    
    fs.readdirSync(Paths.IconPath).forEach(file => {
        const fileName = path.basename(file);
        //check if dir
        if(fs.lstatSync(path.join(Paths.IconPath, file)).isDirectory()){
            return;
        }
        if(fs.existsSync(path.join(Paths.CustomIconPath, fileName)))
            icons.set(fileName,fs.readFileSync(path.join(Paths.CustomIconPath, fileName)) as Buffer);
        else
            icons.set(fileName,fs.readFileSync(path.join(Paths.IconPath, fileName)) as Buffer);
    });

    return icons;
}

export function patchFile(filePath: string, content: string): string {
    console.log(`[TestClient] Patching ${filePath}`);
    let startTime = Date.now();
    
    content = prettier(filePath, content);
    content = autoPatch(filePath, content);
    content = applyPatches(filePath, content);

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

function autoPatch(filePath: string, content: string): string{
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

    //change some vars
    content = content.replace('dsn: "https://fa97a90475514c03a42f80cd36d147c4@sentry.io/140984"', "dsn: (/true/.test(localStorage.sentryOptIn)?'https://6bad92b0175d41a18a037a73d0cff282@sentry.thearcanebrony.net/12':'')");
    content = content.replace('t.DSN = "https://fa97a90475514c03a42f80cd36d147c4@sentry.io/140984"', "t.DSN = (/true/.test(localStorage.sentryOptIn)?'https://6bad92b0175d41a18a037a73d0cff282@sentry.thearcanebrony.net/12':'')");
    content = content.replace('--brand-experiment: hsl(235, calc(var(--saturation-factor, 1) * 85.6%), 64.7%);', '--brand-experiment: hsl(var(--brand-hue), calc(var(--saturation-factor, 1) * 85.6%), 50%);');
    content = content.replaceAll(/--brand-experiment-(\d{1,4}): hsl\(235/g, '--brand-experiment-\$1: hsl(var(--brand-hue)')

    //logos
    content = content.replace(/d: "M23\.0212.*/, `d: "${readAssets().get("homeIcon.path")!.toString()}"`);
    content = content.replace('width: n, height: o, viewBox: "0 0 28 20"', 'width: 48, height: 48, viewBox: "0 0 48 48"');

    //undo webpacking
    // - booleans
    content = content.replace(/!0/g, "true");
    content = content.replace(/!1/g, "false");
    // - real esmodule defs
    content = content.replace(/Object.defineProperty\((.), "__esModule", { value: (.*) }\);/g, '\$1.__esModule = \$2;');

    console.log(`[TestClient] Autopatched ${path.basename(filePath)}!`);
    return content;
}

function applyPatches(filePath: string, content: string): string{
    //get files in testclient_patches
    const patches = fs.readdirSync(TestClientPaths.PatchDir);
    for(let patch of patches){
        //apply patch with git patch
        const patchPath = path.join(TestClientPaths.PatchDir, patch);

    }
    return content;
}