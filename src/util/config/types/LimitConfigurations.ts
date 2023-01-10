import {
	ChannelLimits,
	GlobalRateLimits,
	GuildLimits,
	MessageLimits,
	RateLimits,
	UserLimits,
} from ".";

export class LimitsConfiguration {
	user: UserLimits = new UserLimits();
	guild: GuildLimits = new GuildLimits();
	message: MessageLimits = new MessageLimits();
	channel: ChannelLimits = new ChannelLimits();
	rate: RateLimits = new RateLimits();
	absoluteRate: GlobalRateLimits = new GlobalRateLimits();
}
