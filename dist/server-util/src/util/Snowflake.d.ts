/**
 * A container for useful snowflake-related methods.
 */
export declare class Snowflake {
    static readonly EPOCH = 1420070400000;
    static INCREMENT: bigint;
    static processId: bigint;
    static workerId: bigint;
    constructor();
    /**
     * A Twitter snowflake, except the epoch is 2015-01-01T00:00:00.000Z
     * ```
     * If we have a snowflake '266241948824764416' we can represent it as binary:
     *
     * 64                                          22     17     12          0
     *  000000111011000111100001101001000101000000  00001  00000  000000000000
     *       number of ms since Discord epoch       worker  pid    increment
     * ```
     * @typedef {string} Snowflake
     */
    /**
     * Transforms a snowflake from a decimal string to a bit string.
     * @param  {Snowflake} num Snowflake to be transformed
     * @returns {string}
     * @private
     */
    static idToBinary(num: any): string;
    /**
     * Transforms a snowflake from a bit string to a decimal string.
     * @param  {string} num Bit string to be transformed
     * @returns {Snowflake}
     * @private
     */
    static binaryToID(num: any): string;
    static generate(): bigint;
    /**
     * A deconstructed snowflake.
     * @typedef {Object} DeconstructedSnowflake
     * @property {number} timestamp Timestamp the snowflake was created
     * @property {Date} date Date the snowflake was created
     * @property {number} workerID Worker ID in the snowflake
     * @property {number} processID Process ID in the snowflake
     * @property {number} increment Increment in the snowflake
     * @property {string} binary Binary representation of the snowflake
     */
    /**
     * Deconstructs a Discord snowflake.
     * @param {Snowflake} snowflake Snowflake to deconstruct
     * @returns {DeconstructedSnowflake} Deconstructed snowflake
     */
    static deconstruct(snowflake: any): {
        timestamp: any;
        workerID: number;
        processID: number;
        increment: number;
        binary: string;
    };
}
