export interface Region {
	id: string;
	name: string;
	endpoint?: string;
	location?: {
		latitude: number;
		longitude: number;
	};
	vip: boolean;
	custom: boolean;
	deprecated: boolean;
}
