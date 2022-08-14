import { Region } from ".";

export class RegionConfiguration {
	default: string = "fosscord";
	useDefaultAsOptimal: boolean = true;
	available: Region[] = [
		{
			id: "fosscord",
			name: "Fosscord",
			endpoint: undefined,
			vip: false,
			custom: false,
			deprecated: false
		}
	];
}
