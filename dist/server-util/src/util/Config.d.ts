import "missing-native-js-functions";
declare const _default: {
    init: (opts?: DefaultOptions) => Promise<void>;
    getAll: () => DefaultOptions;
    setAll: (val: any) => any;
};
export default _default;
export interface DefaultOptions {
    api?: any;
    gateway?: any;
    voice?: any;
}
export declare const DefaultOptions: DefaultOptions;
