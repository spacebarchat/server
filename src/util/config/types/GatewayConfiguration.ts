import { EndpointConfiguration } from "./EndpointConfiguration";

export class GatewayConfiguration extends EndpointConfiguration {
    heartbeatTimeout: number = 45_000;
}
