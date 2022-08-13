import EventEmitter from "events";
import { TypedEventEmitter } from "@fosscord/util";

type PluginEvents = {
	error: (error: Error | unknown) => void;
	loaded: () => void;
};

//this doesnt work, check later:
 //(EventEmitter as new () => TypedEventEmitter<PluginEvents>) {
export class Plugin extends EventEmitter {
	private _untypedOn = this.on
	private _untypedEmit = this.emit
	public on = <K extends keyof PluginEvents>(event: K, listener: PluginEvents[K]): this => this._untypedOn(event, listener)
	public emit = <K extends keyof PluginEvents>(event: K, ...args: Parameters<PluginEvents[K]>): boolean => this._untypedEmit(event, ...args)

	async init() {
		// insert default config into database?
	}
}
