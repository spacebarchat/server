import { EndpointConfiguration } from "./EndpointConfiguration";

export class CdnConfiguration extends EndpointConfiguration {
	resizeHeightMax: number = 1000;
	resizeWidthMax: number = 1000;
	imagorServerUrl: string | null = null;
}