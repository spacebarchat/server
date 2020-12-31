import "missing-native-js-functions";
export interface traverseDirectoryOptions {
    dirname: string;
    filter?: RegExp;
    excludeDirs?: RegExp;
    recursive?: boolean;
}
export declare function traverseDirectory<T>(options: traverseDirectoryOptions, action: (path: string) => T): Promise<T[]>;
