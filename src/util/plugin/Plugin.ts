import EventEmitter from "events";
import { TypedEventEmitter } from "@fosscord/util";

type PluginEvents = {
	error: (error: Error | unknown) => void;
	loaded: () => void;
};

export class Plugin extends (EventEmitter as new () => TypedEventEmitter<PluginEvents>) {
	async init() {
		// insert default config into database?
	}
}
