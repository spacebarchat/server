import {
	ApiConfiguration,
	ClientConfiguration,
	DefaultsConfiguration,
	EndpointConfiguration,
	GeneralConfiguration,
	GifConfiguration,
	GuildConfiguration,
	KafkaConfiguration,
	LimitsConfiguration,
	LoginConfiguration,
	MetricsConfiguration,
	RabbitMQConfiguration,
	RegionConfiguration,
	RegisterConfiguration,
	SecurityConfiguration,
	SentryConfiguration,
	TemplateConfiguration
} from ".";

export class ConfigValue {
	gateway: EndpointConfiguration = {
		endpointPrivate: `ws://localhost:3001`,
		endpointPublic: '${location.protocol === "https:" ? "wss://" : "ws://"}${location.host}'
	};
	cdn: EndpointConfiguration = {
		endpointPrivate: `http://localhost:3001`,
		endpointPublic: "${location.host}"
	};
	api: ApiConfiguration = new ApiConfiguration();
	general: GeneralConfiguration = new GeneralConfiguration();
	limits: LimitsConfiguration = new LimitsConfiguration();
	security: SecurityConfiguration = new SecurityConfiguration();
	login: LoginConfiguration = new LoginConfiguration();
	register: RegisterConfiguration = new RegisterConfiguration();
	regions: RegionConfiguration = new RegionConfiguration();
	guild: GuildConfiguration = new GuildConfiguration();
	gif: GifConfiguration = new GifConfiguration();
	rabbitmq: RabbitMQConfiguration = new RabbitMQConfiguration();
	kafka: KafkaConfiguration = new KafkaConfiguration();
	templates: TemplateConfiguration = new TemplateConfiguration();
	client: ClientConfiguration = new ClientConfiguration();
	metrics: MetricsConfiguration = new MetricsConfiguration();
	sentry: SentryConfiguration = new SentryConfiguration();
	defaults: DefaultsConfiguration = new DefaultsConfiguration();
}
