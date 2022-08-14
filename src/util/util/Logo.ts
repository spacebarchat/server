import { existsSync } from "fs";
import { execSync } from "child_process";

export class Logo {
    public static printLogo(){
        if(existsSync("/usr/bin/chafa"))
        return execSync("chafa https://raw.githubusercontent.com/fosscord/fosscord/master/assets-rebrand/svg/Fosscord-Wordmark-Orange.svg", {
			env: process.env,
			encoding: "utf-8",
            stdio: "inherit",
            
		});
        else console.log(Logo.logoVersions['1'] as string)
    }
    private static getConsoleColors(): number {
        return 1;
        if(!process.env.TERM) return 1;
        else {
            switch (process.env.TERM) {
                case "":
                    
                    break;
            
                default:
                    break;
            }
        }
        return 1;
    }
    private static logoVersions: any = {
        '1':
           `███████╗ ██████╗ ███████╗███████╗ ██████╗ ██████╗ ██████╗ ██████╗
            ██╔════╝██╔═══██╗██╔════╝██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔══██╗
            █████╗  ██║   ██║███████╗███████╗██║     ██║   ██║██████╔╝██║  ██║
            ██╔══╝  ██║   ██║╚════██║╚════██║██║     ██║   ██║██╔══██╗██║  ██║
            ██║     ╚██████╔╝███████║███████║╚██████╗╚██████╔╝██║  ██║██████╔╝
            ╚═╝      ╚═════╝ ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝`,
        '2':``
            
    }
}