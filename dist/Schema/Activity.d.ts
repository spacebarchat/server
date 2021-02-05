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
            id: BigIntConstructor;
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
