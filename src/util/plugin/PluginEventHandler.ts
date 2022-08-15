import { PreRegisterEventArgs, OnRegisterEventArgs, PreRegisterEventResult } from './event_types';
import { PreMessageEventArgs, OnMessageEventArgs, PreMessageEventResult } from './event_types';
import { PreLoginEventArgs, OnLoginEventArgs, PreLoginEventResult } from './event_types';
import { PreGuildCreateEventArgs, OnGuildCreateEventArgs, PreGuildCreateEventResult } from './event_types';
import { PreChannelCreateEventArgs, OnChannelCreateEventArgs, PreChannelCreateEventResult } from './event_types';
import { PreTypingEventArgs, OnTypingEventArgs, PreTypingEventResult } from './event_types';
import { PreStatusChangeEventArgs, OnStatusChangeEventArgs, PreStatusChangeEventResult } from './event_types';
import { PluginStore } from ".";

export class PluginEventHandler {
    public static async preRegisterEvent(args: PreRegisterEventArgs): Promise<PreRegisterEventResult[]> {
        return (await Promise.all(PluginStore.plugins.filter(x=>x.onPreRegister).map(x=>x.onPreRegister && x.onPreRegister(args)))).filter(x=>x) as PreRegisterEventResult[];
    }
    
    public static async onRegisterEvent(args: OnRegisterEventArgs): Promise<void> {
        await Promise.all(PluginStore.plugins.filter(x=>x.onRegister).map(x=>x.onRegister && x.onRegister(args)));
    }
    
    public static async preMessageEvent(args: PreMessageEventArgs): Promise<PreMessageEventResult[]> {
        return (await Promise.all(PluginStore.plugins.filter(x=>x.onPreMessage).map(x=>x.onPreMessage && x.onPreMessage(args)))).filter(x=>x) as PreMessageEventResult[];
    }
    
    public static async onMessageEvent(args: OnMessageEventArgs): Promise<void> {
        await Promise.all(PluginStore.plugins.filter(x=>x.onMessage).map(x=>x.onMessage && x.onMessage(args)));
    }
    
    public static async preLoginEvent(args: PreLoginEventArgs): Promise<PreLoginEventResult[]> {
        return (await Promise.all(PluginStore.plugins.filter(x=>x.onPreLogin).map(x=>x.onPreLogin && x.onPreLogin(args)))).filter(x=>x) as PreLoginEventResult[];
    }
    
    public static async onLoginEvent(args: OnLoginEventArgs): Promise<void> {
        await Promise.all(PluginStore.plugins.filter(x=>x.onLogin).map(x=>x.onLogin && x.onLogin(args)));
    }
    
    public static async preGuildCreateEvent(args: PreGuildCreateEventArgs): Promise<PreGuildCreateEventResult[]> {
        return (await Promise.all(PluginStore.plugins.filter(x=>x.onPreGuildCreate).map(x=>x.onPreGuildCreate && x.onPreGuildCreate(args)))).filter(x=>x) as PreGuildCreateEventResult[];
    }
    
    public static async onGuildCreateEvent(args: OnGuildCreateEventArgs): Promise<void> {
        await Promise.all(PluginStore.plugins.filter(x=>x.onGuildCreate).map(x=>x.onGuildCreate && x.onGuildCreate(args)));
    }
    
    public static async preChannelCreateEvent(args: PreChannelCreateEventArgs): Promise<PreChannelCreateEventResult[]> {
        return (await Promise.all(PluginStore.plugins.filter(x=>x.onPreChannelCreate).map(x=>x.onPreChannelCreate && x.onPreChannelCreate(args)))).filter(x=>x) as PreChannelCreateEventResult[];
    }
    
    public static async onChannelCreateEvent(args: OnChannelCreateEventArgs): Promise<void> {
        await Promise.all(PluginStore.plugins.filter(x=>x.onChannelCreate).map(x=>x.onChannelCreate && x.onChannelCreate(args)));
    }
    
    public static async preTypingEvent(args: PreTypingEventArgs): Promise<PreTypingEventResult[]> {
        return (await Promise.all(PluginStore.plugins.filter(x=>x.onPreTyping).map(x=>x.onPreTyping && x.onPreTyping(args)))).filter(x=>x) as PreTypingEventResult[];
    }
    
    public static async onTypingEvent(args: OnTypingEventArgs): Promise<void> {
        await Promise.all(PluginStore.plugins.filter(x=>x.onTyping).map(x=>x.onTyping && x.onTyping(args)));
    }
    
    public static async preStatusChangeEvent(args: PreStatusChangeEventArgs): Promise<PreStatusChangeEventResult[]> {
        return (await Promise.all(PluginStore.plugins.filter(x=>x.onPreStatusChange).map(x=>x.onPreStatusChange && x.onPreStatusChange(args)))).filter(x=>x) as PreStatusChangeEventResult[];
    }
    
    public static async onStatusChangeEvent(args: OnStatusChangeEventArgs): Promise<void> {
        await Promise.all(PluginStore.plugins.filter(x=>x.onStatusChange).map(x=>x.onStatusChange && x.onStatusChange(args)));
    }
    
}
