import EventEmitter from "events";
import { PluginLoadedEventArgs, PluginManifest, TypedEventEmitter } from "@fosscord/util";
import { PluginConfig } from "./PluginConfig";
import { PreRegisterEventArgs, PreRegisterEventResult, OnRegisterEventArgs } from '.';
import { PreMessageEventArgs, PreMessageEventResult, OnMessageEventArgs } from '.';
import { PreLoginEventArgs, PreLoginEventResult, OnLoginEventArgs } from '.';
import { PreGuildCreateEventArgs, PreGuildCreateEventResult, OnGuildCreateEventArgs } from '.';
import { PreChannelCreateEventArgs, PreChannelCreateEventResult, OnChannelCreateEventArgs } from '.';
import { PreTypingEventArgs, PreTypingEventResult, OnTypingEventArgs } from '.';


/*type PluginEvents = {
	error: (error: Error | unknown) => void;
	loaded: () => void;
};*/

//this doesnt work, check later:
 //EventEmitter as new () => TypedEventEmitter<PluginEvents>
export class Plugin {
	/**
	 * Path the plugin resides in.
	 *
	 * @type {string}
	 * @memberof Plugin
	 */
	pluginPath?: string;
	pluginManifest?: PluginManifest;
	/**
	 *	
	 *
	 * @param {PluginLoadedEventArgs} args Info about plugin environment
	 * @memberof Plugin
	 */
	async onPluginLoaded?(args?: PluginLoadedEventArgs) {
		
	}

	//generated
    /**
    * RegisterEvent: document me
    *
    * @param {OnRegisterEventArgs} args Info about what's going on
    * @memberof Plugin
    */
	async onRegister?(args: OnRegisterEventArgs): Promise<void>;

	/**
	 * RegisterEvent: Executed before changes are announced
	 * document me.
	 *
	 * @param {PreRegisterEventArgs} args Info about what's going on
	 * @return {PreRegisterEventResult} How event should be handled
	 * @memberof Plugin
	 */
	async onPreRegister?(args: PreRegisterEventArgs): Promise<PreRegisterEventResult>;
	/**
	 * MessageEvent: document me
	 *
	 * @param {OnMessageEventArgs} args Info about what's going on
	 * @memberof Plugin
	 */
	async onMessage?(args: OnMessageEventArgs): Promise<void>;

	/**
	 * MessageEvent: Executed before changes are announced
	 * document me.
	 *
	 * @param {PreMessageEventArgs} args Info about what's going on
	 * @return {PreMessageEventResult} How event should be handled
	 * @memberof Plugin
	 */
	async onPreMessage?(args: PreMessageEventArgs): Promise<PreMessageEventResult>;
	/**
	 * LoginEvent: document me
	 *
	 * @param {OnLoginEventArgs} args Info about what's going on
	 * @memberof Plugin
	 */
	async onLogin?(args: OnLoginEventArgs): Promise<void>;

	/**
	 * LoginEvent: Executed before changes are announced
	 * document me.
	 *
	 * @param {PreLoginEventArgs} args Info about what's going on
	 * @return {PreLoginEventResult} How event should be handled
	 * @memberof Plugin
	 */
	async onPreLogin?(args: PreLoginEventArgs): Promise<PreLoginEventResult>;
	/**
	 * GuildCreateEvent: document me
	 *
	 * @param {OnGuildCreateEventArgs} args Info about what's going on
	 * @memberof Plugin
	 */
	async onGuildCreate?(args: OnGuildCreateEventArgs): Promise<void>;

	/**
	 * GuildCreateEvent: Executed before changes are announced
	 * document me.
	 *
	 * @param {PreGuildCreateEventArgs} args Info about what's going on
	 * @return {PreGuildCreateEventResult} How event should be handled
	 * @memberof Plugin
	 */
	async onPreGuildCreate?(args: PreGuildCreateEventArgs): Promise<PreGuildCreateEventResult>;
	/**
	 * ChannelCreateEvent: document me
	 *
	 * @param {OnChannelCreateEventArgs} args Info about what's going on
	 * @memberof Plugin
	 */
	async onChannelCreate?(args: OnChannelCreateEventArgs): Promise<void>;

	/**
	 * ChannelCreateEvent: Executed before changes are announced
	 * document me.
	 *
	 * @param {PreChannelCreateEventArgs} args Info about what's going on
	 * @return {PreChannelCreateEventResult} How event should be handled
	 * @memberof Plugin
	 */
	async onPreChannelCreate?(args: PreChannelCreateEventArgs): Promise<PreChannelCreateEventResult>;
	/**
	 * TypingEvent: document me
	 *
	 * @param {OnTypingEventArgs} args Info about what's going on
	 * @memberof Plugin
	 */
	async onTyping?(args: OnTypingEventArgs): Promise<void>;

	/**
	 * TypingEvent: Executed before changes are announced
	 * document me.
	 *
	 * @param {PreTypingEventArgs} args Info about what's going on
	 * @return {PreTypingEventResult} How event should be handled
	 * @memberof Plugin
	 */
	async onPreTyping?(args: PreTypingEventArgs): Promise<PreTypingEventResult>;
}
