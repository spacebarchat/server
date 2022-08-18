import { Region } from ".";

export class RegionConfiguration {
    default = "fosscord";
    useDefaultAsOptimal = true;
    available: Region[] = [
        {
            id: "fosscord",
            name: "Fosscord",
            endpoint: "127.0.0.1:3004",
            vip: false,
            custom: false,
            deprecated: false,
        },
    ];
}
