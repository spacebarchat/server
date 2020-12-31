export = SnowflakeUtil;
/**
 * A container for useful snowflake-related methods.
 */
declare class SnowflakeUtil {
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
    private static idToBinary;
    /**
     * Transforms a snowflake from a bit string to a decimal string.
     * @param  {string} num Bit string to be transformed
     * @returns {Snowflake}
     * @private
     */
    private static binaryToID;
    /**
     * Generates a Discord snowflake.
     * <info>This hardcodes the worker ID as 1 and the process ID as 0.</info>
     * @param {number|Date} [timestamp=Date.now()] Timestamp or date of the snowflake to generate
     * @returns {Snowflake} The generated snowflake
     */
    static generate(timestamp?: number | Date | undefined): string;
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
    static deconstruct(snowflake: string): {
        /**
         * Timestamp the snowflake was created
         */
        timestamp: number;
        /**
         * Date the snowflake was created
         */
        date: Date;
        /**
         * Worker ID in the snowflake
         */
        workerID: number;
        /**
         * Process ID in the snowflake
         */
        processID: number;
        /**
         * Increment in the snowflake
         */
        increment: number;
        /**
         * Binary representation of the snowflake
         */
        binary: string;
    };
    /**
     * Discord's epoch value (2015-01-01T00:00:00.000Z).
     * @type {number}
     * @readonly
     */
    static readonly get EPOCH(): number;
}
