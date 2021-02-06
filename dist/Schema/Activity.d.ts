import { EmojiSchema } from "./Emoji";
export declare const ActivitySchema: {
    afk: BooleanConstructor;
    status: StringConstructor;
    $activities: {
        name: StringConstructor;
        type: NumberConstructor;
        $url: StringConstructor;
        $created_at: NumberConstructor;
        $timestamps: {
            start: NumberConstructor;
            end: NumberConstructor;
        };
        $application_id: BigIntConstructor;
        $details: StringConstructor;
        $State: StringConstructor;
        $emoji: {
            name: StringConstructor;
            $id: BigIntConstructor;
            animated: BooleanConstructor;
        };
        $party: {
            $id: StringConstructor;
            $size: NumberConstructor[];
        };
        $assets: {
            $large_image: StringConstructor;
            $large_text: StringConstructor;
            $small_image: StringConstructor;
            $small_text: StringConstructor;
        };
        $secrets: {
            $join: StringConstructor;
            $spectate: StringConstructor;
            $match: StringConstructor;
        };
        $instance: BooleanConstructor;
        flags: BigIntConstructor;
    }[];
    $since: NumberConstructor;
};
export interface ActivitySchema {
    afk: boolean;
    status: string;
    activities?: [
        {
            name: string;
            type: number;
            url?: string;
            created_at?: number;
            timestamps?: {
                start: number;
                end: number;
            };
            application_id?: bigint;
            details?: string;
            State?: string;
            emoji?: EmojiSchema;
            party?: {
                id?: string;
                size?: [number];
            };
            assets?: {
                large_image?: string;
                large_text?: string;
                small_image?: string;
                small_text?: string;
            };
            secrets?: {
                join?: string;
                spectate?: string;
                match?: string;
            };
            instance?: boolean;
            flags: bigint;
        }
    ];
    since?: number;
}
