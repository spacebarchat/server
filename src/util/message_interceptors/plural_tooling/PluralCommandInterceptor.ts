import {
    emitEvent,
    IMessageInterceptor, Message,
    MessageCreateEvent, MessageDeleteEvent, MessageFlags,
    MessageInterceptorContext,
    MessageInterceptResult, MessageTypes
} from "@fosscord/util";

export class PluralCommandInterceptor implements IMessageInterceptor {
    async execute(ctx: MessageInterceptorContext): Promise<MessageInterceptResult> {
        let result = new MessageInterceptResult();
        result.cancel = false;
        result.message = ctx.message;

        if(ctx.message.content?.toLowerCase().startsWith("p;")) {
            console.log("[PluralCommandInterceptor] Plural command prefix detected, cancelling message send. Content: ", ctx.message.content)
            result.cancel = true;
        }


        if(result.cancel) {
            /*await emitEvent({
                event: "MESSAGE_DELETE",
                channel_id: ctx.message.channel_id,
                data: {
                    id: ctx.message.id,
                    channel_id: ctx.message.channel_id,
                    guild_id: ctx.message.guild_id
                },
            } as MessageDeleteEvent);*/
            //result.message.flags = String((BigInt(ctx.message.flags ?? "0")) | MessageTypes.);
            // @ts-ignore
            result.message.ephemeral = true;
            result.message.content += ' (ephemeral?)';
            /*await emitEvent({
                event: "MESSAGE_CREATE",
                //channel_id: ctx.opts.channel_id,
                user_id: ctx.opts.author_id,
                data: ctx.message.toJSON(),
            } as MessageCreateEvent);*/
        }

        return result;
    }

}