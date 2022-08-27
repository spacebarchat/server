import { TypedEventEmitter } from "@fosscord/util";
import EventEmitter from "events";

type PluginEvents = {
	error: (error: Error | unknown) => void;
	loaded: () => void;
};

export class Plugin extends (EventEmitter as new () => TypedEventEmitter<PluginEvents>) {
	async init() {
		// insert default config into database?
	}
}
