// @ts-nocheck
// github.com/discordjs/discord.js/blob/master/src/util/Snowflake.js
"use strict";
// Discord epoch (2015-01-01T00:00:00.000Z)
const EPOCH = 1420070400000;
let INCREMENT = 0;
/**
 * A container for useful snowflake-related methods.
 */
class SnowflakeUtil {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
    }
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
    static idToBinary(num) {
        let bin = "";
        let high = parseInt(num.slice(0, -10)) || 0;
        let low = parseInt(num.slice(-10));
        while (low > 0 || high > 0) {
            bin = String(low & 1) + bin;
            low = Math.floor(low / 2);
            if (high > 0) {
                low += 5000000000 * (high % 2);
                high = Math.floor(high / 2);
            }
        }
        return bin;
    }
    /**
     * Transforms a snowflake from a bit string to a decimal string.
     * @param  {string} num Bit string to be transformed
     * @returns {Snowflake}
     * @private
     */
    static binaryToID(num) {
        let dec = "";
        while (num.length > 50) {
            const high = parseInt(num.slice(0, -32), 2);
            const low = parseInt((high % 10).toString(2) + num.slice(-32), 2);
            dec = (low % 10).toString() + dec;
            num =
                Math.floor(high / 10).toString(2) +
                    Math.floor(low / 10)
                        .toString(2)
                        .padStart(32, "0");
        }
        num = parseInt(num, 2);
        while (num > 0) {
            dec = (num % 10).toString() + dec;
            num = Math.floor(num / 10);
        }
        return dec;
    }
    /**
     * Generates a Discord snowflake.
     * <info>This hardcodes the worker ID as 1 and the process ID as 0.</info>
     * @param {number|Date} [timestamp=Date.now()] Timestamp or date of the snowflake to generate
     * @returns {Snowflake} The generated snowflake
     */
    static generate(timestamp = Date.now()) {
        if (timestamp instanceof Date)
            timestamp = timestamp.getTime();
        if (typeof timestamp !== "number" || isNaN(timestamp)) {
            throw new TypeError(`"timestamp" argument must be a number (received ${isNaN(timestamp) ? "NaN" : typeof timestamp})`);
        }
        if (INCREMENT >= 4095)
            INCREMENT = 0;
        const BINARY = `${(timestamp - EPOCH).toString(2).padStart(42, "0")}0000100000${(INCREMENT++)
            .toString(2)
            .padStart(12, "0")}`;
        return SnowflakeUtil.binaryToID(BINARY);
    }
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
    static deconstruct(snowflake) {
        const BINARY = SnowflakeUtil.idToBinary(snowflake).toString(2).padStart(64, "0");
        const res = {
            timestamp: parseInt(BINARY.substring(0, 42), 2) + EPOCH,
            workerID: parseInt(BINARY.substring(42, 47), 2),
            processID: parseInt(BINARY.substring(47, 52), 2),
            increment: parseInt(BINARY.substring(52, 64), 2),
            binary: BINARY,
        };
        Object.defineProperty(res, "date", {
            get: function get() {
                return new Date(this.timestamp);
            },
            enumerable: true,
        });
        return res;
    }
    /**
     * Discord's epoch value (2015-01-01T00:00:00.000Z).
     * @type {number}
     * @readonly
     */
    static get EPOCH() {
        return EPOCH;
    }
}
module.exports = SnowflakeUtil;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU25vd2ZsYWtlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1Nub3dmbGFrZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxjQUFjO0FBRWQsb0VBQW9FO0FBQ3BFLFlBQVksQ0FBQztBQUViLDJDQUEyQztBQUMzQyxNQUFNLEtBQUssR0FBRyxhQUFhLENBQUM7QUFDNUIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBRWxCOztHQUVHO0FBQ0gsTUFBTSxhQUFhO0lBQ2xCO1FBQ0MsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxpQ0FBaUMsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFFRDs7Ozs7Ozs7OztPQVVHO0lBRUg7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUc7UUFDcEIsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUMsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25DLE9BQU8sR0FBRyxHQUFHLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFO1lBQzNCLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUM1QixHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDMUIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFO2dCQUNiLEdBQUcsSUFBSSxVQUFVLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQzthQUM1QjtTQUNEO1FBQ0QsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUc7UUFDcEIsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBRWIsT0FBTyxHQUFHLENBQUMsTUFBTSxHQUFHLEVBQUUsRUFBRTtZQUN2QixNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1QyxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVsRSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLEdBQUcsR0FBRyxDQUFDO1lBQ2xDLEdBQUc7Z0JBQ0YsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDakMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO3lCQUNsQixRQUFRLENBQUMsQ0FBQyxDQUFDO3lCQUNYLFFBQVEsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDckI7UUFFRCxHQUFHLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN2QixPQUFPLEdBQUcsR0FBRyxDQUFDLEVBQUU7WUFDZixHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLEdBQUcsR0FBRyxDQUFDO1lBQ2xDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQztTQUMzQjtRQUVELE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNyQyxJQUFJLFNBQVMsWUFBWSxJQUFJO1lBQUUsU0FBUyxHQUFHLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMvRCxJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDdEQsTUFBTSxJQUFJLFNBQVMsQ0FDbEIsbURBQW1ELEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLFNBQVMsR0FBRyxDQUNqRyxDQUFDO1NBQ0Y7UUFDRCxJQUFJLFNBQVMsSUFBSSxJQUFJO1lBQUUsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNyQyxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLENBQUM7YUFDM0YsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUNYLFFBQVEsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUN0QixPQUFPLGFBQWEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUVIOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVM7UUFDM0IsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNqRixNQUFNLEdBQUcsR0FBRztZQUNYLFNBQVMsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSztZQUN2RCxRQUFRLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMvQyxTQUFTLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNoRCxTQUFTLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNoRCxNQUFNLEVBQUUsTUFBTTtTQUNkLENBQUM7UUFDRixNQUFNLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUU7WUFDbEMsR0FBRyxFQUFFLFNBQVMsR0FBRztnQkFDaEIsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDakMsQ0FBQztZQUNELFVBQVUsRUFBRSxJQUFJO1NBQ2hCLENBQUMsQ0FBQztRQUNILE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxNQUFNLEtBQUssS0FBSztRQUNmLE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztDQUNEO0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMifQ==