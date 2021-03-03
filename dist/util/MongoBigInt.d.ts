import mongoose from "mongoose";
declare class LongSchema extends mongoose.SchemaType {
    $conditionalHandlers: {
        $lt: (val: any) => any;
        $lte: (val: any) => any;
        $gt: (val: any) => any;
        $gte: (val: any) => any;
        $ne: (val: any) => any;
        $in: (val: any) => any;
        $nin: (val: any) => any;
        $mod: (val: any) => any;
        $all: (val: any) => any;
        $bitsAnySet: (val: any) => any;
        $bitsAllSet: (val: any) => any;
    };
    handleSingle(val: any): any;
    handleArray(val: any): any;
    checkRequired(val: any): boolean;
    cast(val: any, scope?: any, init?: any, type?: string): any;
    castForQuery($conditional: string, value: any): any;
}
declare module "mongoose" {
    namespace Types {
        class Long extends mongoose.mongo.Long {
        }
    }
    namespace Schema {
        namespace Types {
            class Long extends LongSchema {
            }
        }
    }
}
export {};
